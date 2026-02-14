/**
 * Breadcrumb Builder Component
 * Dynamically generates breadcrumbs based on route and resource metadata
 */

import { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbSegment {
    label: string;
    path: string;
    isActive: boolean;
}

interface BreadcrumbBuilderProps {
    resourceTitle?: string;
    pageTitle?: string;
    customSegments?: BreadcrumbSegment[];
}

/**
 * Format segment name for display
 */
function formatSegmentName(segment: string): string {
    // Handle special cases
    const specialCases: Record<string, string> = {
        'dashboard': 'Dashboard',
        'resource': '',
        'settings': 'Ayarlar',
        'profile': 'Profil',
        'users': 'Kullanıcılar',
        'products': 'Ürünler',
        'posts': 'Yazılar',
        'categories': 'Kategoriler',
    };

    if (specialCases[segment] !== undefined) {
        return specialCases[segment];
    }

    // Capitalize first letter
    return segment.charAt(0).toUpperCase() + segment.slice(1);
}

/**
 * Parse pathname into breadcrumb segments
 */
function parsePathname(pathname: string): BreadcrumbSegment[] {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbSegment[] = [];

    // Always add dashboard
    breadcrumbs.push({
        label: 'Dashboard',
        path: '/dashboard',
        isActive: false,
    });

    let currentPath = '';
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        currentPath += `/${segment}`;

        // Skip 'resource' segment, but include the resource name
        if (segment === 'resource' && i + 1 < segments.length) {
            const resourceName = segments[i + 1];
            const label = formatSegmentName(resourceName);
            if (label) {
                breadcrumbs.push({
                    label,
                    path: currentPath + `/${resourceName}`,
                    isActive: i + 1 === segments.length - 1,
                });
            }
            i++; // Skip next segment as we've already processed it
            currentPath += `/${resourceName}`;
            continue;
        }

        const label = formatSegmentName(segment);
        if (label) {
            breadcrumbs.push({
                label,
                path: currentPath,
                isActive: i === segments.length - 1,
            });
        }
    }

    return breadcrumbs;
}

export function BreadcrumbBuilder({
    resourceTitle,
    pageTitle,
    customSegments,
}: BreadcrumbBuilderProps) {
    const location = useLocation();

    const breadcrumbs = useMemo(() => {
        // Use custom segments if provided
        if (customSegments && customSegments.length > 0) {
            return customSegments;
        }

        // Parse pathname
        let segments = parsePathname(location.pathname);

        // Override last segment with resourceTitle if provided
        if (resourceTitle && segments.length > 0) {
            segments[segments.length - 1] = {
                ...segments[segments.length - 1],
                label: resourceTitle,
            };
        }

        // Add pageTitle as last segment if provided
        if (pageTitle) {
            segments.push({
                label: pageTitle,
                path: location.pathname,
                isActive: true,
            });
        }

        return segments;
    }, [location.pathname, resourceTitle, pageTitle, customSegments]);

    // Dashboard sayfasında breadcrumb gösterme
    if (breadcrumbs.length === 0 || location.pathname === '/dashboard') {
        return null;
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbs.map((segment, index) => (
                    <div key={segment.path} className="flex items-center">
                        {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                        <BreadcrumbItem className="hidden md:block">
                            {segment.isActive ? (
                                <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link to={segment.path}>{segment.label}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    </div>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
