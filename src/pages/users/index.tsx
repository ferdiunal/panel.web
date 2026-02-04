/**
 * User Resource Index Page
 * Displays list of users with CRUD operations
 */

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormView } from '@/components/views/FormView';
import { DetailView } from '@/components/views/DetailView';
import { IndexView } from '@/components/views/IndexView';
import { getCreateFields, getUpdateFields, getDetailFields } from '@/resources/user';
import type { User, AnyResource } from '@/types';
import { useAuthStore } from '@/stores';
import { redirect } from 'react-router-dom';


export const loader = async () => {
    try {
        await useAuthStore.getState().checkSession()
    } catch {
        return redirect('/login');
    }
}


export default function UsersPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'update'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch users
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        {
          id: '1',
          type: 'user',
          name: 'John Doe',
          attributes: {
            name: 'John Doe',
            email: 'john@example.com',
            role: 'admin',
            status: 'active',
            phone: '+1234567890',
            address: '123 Main St',
            city: 'New York',
            country: 'USA',
            postal_code: '10001',
            bio: 'Admin user',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          type: 'user',
          name: 'Jane Smith',
          attributes: {
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'user',
            status: 'active',
            phone: '+1234567891',
            address: '456 Oak Ave',
            city: 'Los Angeles',
            country: 'USA',
            postal_code: '90001',
            bio: 'Regular user',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as User[];
    },
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      // Mock API call
      const newUser: User = {
        id: String(Date.now()),
        type: 'user',
        name: data.name as string,
        attributes: {
          name: data.name as string,
          email: data.email as string,
          role: data.role as string,
          status: (data.status as 'active' | 'inactive') || 'active',
          phone: data.phone as string | undefined,
          address: data.address as string | undefined,
          city: data.city as string | undefined,
          country: data.country as string | undefined,
          postal_code: data.postal_code as string | undefined,
          bio: data.bio as string | undefined,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return newUser;
    },
    onSuccess: () => {
      toast.success('User created successfully');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(`Failed to create user: ${error.message}`);
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      if (!selectedUser) throw new Error('No user selected');
      // Mock API call
      return {
        ...selectedUser,
        attributes: {
          name: data.name as string,
          email: data.email as string,
          role: data.role as string,
          status: (data.status as 'active' | 'inactive') || 'active',
          phone: data.phone as string | undefined,
          address: data.address as string | undefined,
          city: data.city as string | undefined,
          country: data.country as string | undefined,
          postal_code: data.postal_code as string | undefined,
          bio: data.bio as string | undefined,
        },
      };
    },
    onSuccess: () => {
      toast.success('User updated successfully');
      setIsFormOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Mock API call
      return userId;
    },
    onSuccess: () => {
      toast.success('User deleted successfully');
      setIsDetailOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });

  const handleCreateClick = () => {
    setFormMode('create');
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (user: User) => {
    setFormMode('update');
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleViewClick = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    if (formMode === 'create') {
      await createMutation.mutateAsync(data);
    } else if (selectedUser) {
      await updateMutation.mutateAsync(data);
    }
  };

  const handleDelete = async () => {
    if (selectedUser) {
      await deleteMutation.mutateAsync(selectedUser.id);
    }
  };

  const createFields = useMemo(() => getCreateFields(), []);
  const updateFields = useMemo(() => getUpdateFields(), []);
  const detailFields = useMemo(() => getDetailFields(), []);

  const columns = useMemo(
    () => [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'role', label: 'Role', sortable: true },
      { key: 'status', label: 'Status', sortable: true },
    ],
    []
  );

  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Index View */}
      <IndexView
        resources={users as AnyResource[]}
        columns={columns}
        isLoading={isLoading}
        error={error ? (error as Error).message : null}
        onEdit={(resource) => handleEditClick(resource as User)}
        onView={(resource) => handleViewClick(resource as User)}
        onDelete={(resource) => {
          setSelectedUser(resource as User);
          handleDelete();
        }}
      />

      {/* Form Modal */}
      <FormView
        resourceType="user"
        mode={formMode}
        resource={selectedUser || undefined}
        fields={formMode === 'create' ? createFields : updateFields}
        isOpen={isFormOpen}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setIsFormOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          setIsFormOpen(false);
          setSelectedUser(null);
        }}
      />

      {/* Detail Modal */}
      <DetailView
        resourceType="user"
        resource={selectedUser || null}
        fields={detailFields}
        isOpen={isDetailOpen}
        isLoading={false}
        isDeleting={deleteMutation.isPending}
        onEdit={() => {
          setIsDetailOpen(false);
          if (selectedUser) handleEditClick(selectedUser);
        }}
        onDelete={() => handleDelete()}
        onDeleteConfirm={() => handleDelete()}
        onDeleteCancel={() => {}}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
}
