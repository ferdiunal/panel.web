/**
 * PhoneInput Component
 *
 * Uluslararası telefon numarası girişi için kullanılan gelişmiş bileşen.
 * react-phone-number-input kütüphanesi ile ülke seçimi ve otomatik formatlama desteği sağlar.
 *
 * Özellikler:
 * - Ülke bayrağı ve kod seçimi
 * - Otomatik telefon numarası formatlaması
 * - E.164 formatında değer döndürme
 * - Arama yapılabilir ülke listesi
 * - Shadcn/ui bileşenleri ile entegrasyon
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * import { PhoneInput } from '@/components/ui/phone-input';
 *
 * function MyForm() {
 *   const [phone, setPhone] = useState('');
 *
 *   return (
 *     <PhoneInput
 *       value={phone}
 *       onChange={setPhone}
 *       defaultCountry="TR"
 *       placeholder="Telefon numaranızı girin"
 *     />
 *   );
 * }
 * ```
 */

import * as React from "react";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value" | "ref"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void;
  };

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
    ({ className, onChange, value, ...props }, ref) => {
      return (
        <RPNInput.default
          ref={ref}
          className={cn("flex", className)}
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect}
          inputComponent={InputComponent}
          smartCaret={false}
          value={value || undefined}
          /**
           * onChange event handler
           *
           * react-phone-number-input, geçerli bir telefon numarası girilmediğinde
           * onChange event'ini undefined olarak tetikleyebilir. Bunu önlemek için
           * değer boş string'e dönüştürülür.
           *
           * @param {E164Number | undefined} value - Girilen değer
           */
          onChange={(value) => onChange?.(value || ("" as RPNInput.Value))}
          {...props}
        />
      );
    },
  );
PhoneInput.displayName = "PhoneInput";

/**
 * Input Component
 *
 * Telefon numarası girişi için özelleştirilmiş input bileşeni.
 * Shadcn/ui Input bileşenini kullanır ve sağ tarafta yuvarlatılmış köşeler ile gösterilir.
 */
const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
  <Input
    className={cn("rounded-e-lg rounded-s-none", className)}
    {...props}
    ref={ref}
  />
));
InputComponent.displayName = "InputComponent";

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  options: CountryEntry[];
  onChange: (country: RPNInput.Country) => void;
};

/**
 * Country Select Component
 *
 * Ülke seçimi için popover içinde arama yapılabilir liste bileşeni.
 * Ülke bayrağı, adı ve telefon kodu ile birlikte gösterilir.
 *
 * @param disabled - Bileşenin devre dışı olup olmadığı
 * @param value - Seçili ülke kodu
 * @param options - Ülke listesi
 * @param onChange - Ülke değiştiğinde çağrılacak callback
 */
const CountrySelect = ({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
}: CountrySelectProps) => {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Popover
      open={isOpen}
      modal
      onOpenChange={(open) => {
        setIsOpen(open);
        open && setSearchValue("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="flex gap-1 rounded-e-none rounded-s-lg border-r-0 px-3 focus:z-10"
          disabled={disabled}
        >
          <FlagComponent
            country={selectedCountry}
            countryName={selectedCountry}
          />
          <ChevronsUpDown
            className={cn(
              "-mr-2 size-4 opacity-50",
              disabled ? "hidden" : "opacity-100",
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            value={searchValue}
            onValueChange={(value) => {
              setSearchValue(value);
              // Arama yapıldığında scroll pozisyonunu en üste al
              setTimeout(() => {
                if (scrollAreaRef.current) {
                  const viewportElement = scrollAreaRef.current.querySelector(
                    "[data-radix-scroll-area-viewport]",
                  );
                  if (viewportElement) {
                    viewportElement.scrollTop = 0;
                  }
                }
              }, 0);
            }}
            placeholder="Ülke ara..."
          />
          <CommandList>
            <ScrollArea ref={scrollAreaRef} className="h-72">
              <CommandEmpty>Ülke bulunamadı.</CommandEmpty>
              <CommandGroup>
                {countryList.map(({ value, label }) =>
                  value ? (
                    <CountrySelectOption
                      key={value}
                      country={value}
                      countryName={label}
                      selectedCountry={selectedCountry}
                      onChange={onChange}
                      onSelectComplete={() => setIsOpen(false)}
                    />
                  ) : null,
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

interface CountrySelectOptionProps extends RPNInput.FlagProps {
  selectedCountry: RPNInput.Country;
  onChange: (country: RPNInput.Country) => void;
  onSelectComplete: () => void;
}

/**
 * Country Select Option Component
 *
 * Ülke listesindeki her bir ülke seçeneği için bileşen.
 * Bayrak, ülke adı, telefon kodu ve seçim işareti gösterir.
 */
const CountrySelectOption = ({
  country,
  countryName,
  selectedCountry,
  onChange,
  onSelectComplete,
}: CountrySelectOptionProps) => {
  const handleSelect = () => {
    onChange(country);
    onSelectComplete();
  };

  return (
    <CommandItem className="gap-2" onSelect={handleSelect}>
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-sm text-foreground/50">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
      <CheckIcon
        className={`ml-auto size-4 ${country === selectedCountry ? "opacity-100" : "opacity-0"}`}
      />
    </CommandItem>
  );
};

/**
 * Flag Component
 *
 * Ülke bayrağını gösteren bileşen.
 * react-phone-number-input/flags paketinden bayrak SVG'lerini kullanır.
 */
const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg:not([class*='size-'])]:size-full">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};

export { PhoneInput };
