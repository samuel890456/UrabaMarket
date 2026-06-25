import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { getCities, getCountries, getStates } from "../../services/locationApi";
import { cn } from "../../utils/cn";

export function LocationSelects({
  value,
  onChange,
  errors = {},
  className,
  countryLabel = "Pais",
  stateLabel = "Departamento / Estado",
  cityLabel = "Ciudad",
  defaultCountryIso2 = "CO"
}) {
  const location = {
    countryIso2: value?.countryIso2 || defaultCountryIso2,
    countryName: value?.countryName || "",
    stateIso2: value?.stateIso2 || "",
    stateName: value?.stateName || "",
    cityName: value?.cityName || ""
  };

  const countriesQuery = useQuery({
    queryKey: ["locations", "countries"],
    queryFn: getCountries,
    staleTime: 1000 * 60 * 60 * 24
  });

  const statesQuery = useQuery({
    queryKey: ["locations", "states", location.countryIso2],
    queryFn: () => getStates(location.countryIso2),
    enabled: Boolean(location.countryIso2),
    staleTime: 1000 * 60 * 60 * 24
  });

  const citiesQuery = useQuery({
    queryKey: ["locations", "cities", location.countryIso2, location.stateIso2],
    queryFn: () => getCities(location.countryIso2, location.stateIso2),
    enabled: Boolean(location.countryIso2 && location.stateIso2),
    staleTime: 1000 * 60 * 60 * 24
  });

  const countries = countriesQuery.data ?? [];
  const states = statesQuery.data ?? [];
  const cities = citiesQuery.data ?? [];

  function updateCountry(iso2) {
    const selected = countries.find((country) => country.iso2 === iso2);
    onChange({
      countryIso2: iso2,
      countryName: selected?.name ?? "",
      stateIso2: "",
      stateName: "",
      cityName: ""
    });
  }

  function updateState(iso2) {
    const selected = states.find((state) => state.iso2 === iso2);
    onChange({
      ...location,
      stateIso2: iso2,
      stateName: selected?.name ?? "",
      cityName: ""
    });
  }

  function updateCity(cityName) {
    onChange({ ...location, cityName });
  }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-3", className)}>
      <SelectBlock
        label={countryLabel}
        value={location.countryIso2}
        onChange={(event) => updateCountry(event.target.value)}
        disabled={countriesQuery.isLoading}
        loading={countriesQuery.isLoading}
        error={errors.country}
      >
        <option value="">Selecciona pais</option>
        {countries.map((country) => (
          <option key={country.iso2} value={country.iso2}>
            {country.emoji ? `${country.emoji} ` : ""}{country.name}
          </option>
        ))}
      </SelectBlock>

      <SelectBlock
        label={stateLabel}
        value={location.stateIso2}
        onChange={(event) => updateState(event.target.value)}
        disabled={!location.countryIso2 || statesQuery.isLoading}
        loading={statesQuery.isLoading}
        error={errors.state}
      >
        <option value="">Selecciona departamento</option>
        {states.map((state) => (
          <option key={state.iso2} value={state.iso2}>
            {state.name}
          </option>
        ))}
      </SelectBlock>

      <SearchableCitySelect
        label={cityLabel}
        value={location.cityName}
        cities={cities}
        onChange={updateCity}
        disabled={!location.stateIso2 || citiesQuery.isLoading}
        loading={citiesQuery.isLoading}
        error={errors.city}
      />

      {countriesQuery.isError || statesQuery.isError || citiesQuery.isError ? (
        <p className="sm:col-span-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          No pudimos cargar ubicaciones en este momento. Revisa tu conexion e intenta de nuevo.
        </p>
      ) : null}
    </div>
  );
}

function SelectBlock({ label, error, loading, children, ...props }) {
  return (
    <label className="block w-full">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <select
        className={cn(
          "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-ink shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:bg-slate-50 disabled:text-slate-400",
          error && "border-red-400 focus:ring-red-200"
        )}
        {...props}
      >
        {children}
      </select>
      {loading ? <span className="mt-1 block text-xs text-slate-500">Cargando...</span> : null}
      {error ? <span className="mt-1 block text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

function SearchableCitySelect({ label, value, cities, onChange, disabled, loading, error }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return cities
      .filter((city) => !term || city.name.toLowerCase().includes(term))
      .slice(0, 80);
  }, [cities, query]);

  return (
    <div className="block w-full">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <div className={cn("rounded-lg border border-slate-200 bg-white shadow-sm focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10", error && "border-red-400 focus-within:ring-red-200", disabled && "bg-slate-50")}>
        <div className="flex h-10 items-center gap-2 border-b border-slate-100 px-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={loading ? "Cargando..." : "Buscar ciudad"}
            disabled={disabled}
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:text-slate-400"
          />
        </div>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="h-11 w-full rounded-b-lg bg-transparent px-3.5 text-sm text-ink outline-none disabled:text-slate-400"
        >
          <option value="">Selecciona ciudad</option>
          {filtered.map((city) => (
            <option key={`${city.id}-${city.name}`} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </div>
      {loading ? <span className="mt-1 block text-xs text-slate-500">Cargando ciudades...</span> : null}
      {error ? <span className="mt-1 block text-xs font-medium text-red-600">{error}</span> : null}
    </div>
  );
}
