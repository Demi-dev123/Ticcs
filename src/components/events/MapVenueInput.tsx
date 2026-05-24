import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';

interface MapVenueInputProps {
  value: string;
  onChange: (value: string) => void;
  brandColor?: string;
}

interface LocationResult {
  name: string;
  address: string;
}

// Interactive preset list fallback of premium global convention centers and community workspaces
const VENUE_PRESETS: LocationResult[] = [
  { name: 'Landmark Centre, Victoria Island', address: 'Plot 2 & 3 Water Corporation Dr, Lagos, Nigeria' },
  { name: 'Eko Hotels & Suites Grand Ballroom', address: 'Plot 1415 Adetokunbo Ademola St, Victoria Island, Lagos' },
  { name: 'The Civic Centre', address: 'Ozumba Mbadiwe Ave, Victoria Island, Lagos' },
  { name: 'Co-Creation Hub (CcHUB)', address: 'Herbert Macaulay Way, Yaba, Lagos, Nigeria' },
  { name: 'Moscone Center', address: '747 Howard St, San Francisco, CA 94103, United States' },
  { name: 'Javits Center', address: '429 11th Ave, New York, NY 10001, United States' },
  { name: 'ExCeL London', address: 'Royal Victoria Dock, 1 Western Gateway, London E16 1XL, UK' },
  { name: 'The Barbican Centre', address: 'Silk St, London EC2Y 8DS, United Kingdom' },
  { name: 'Somerset House', address: 'Strand, London WC2R 1LA, United Kingdom' },
  { name: 'Station F', address: '55 Boulevard Vincent Auriol, 75013 Paris, France' },
  { name: 'Factory Berlin', address: 'Rheinsberger Str. 76/77, 10115 Berlin, Germany' },
  { name: 'Shibuya Sky & Exchange Space', address: '2 Chome-24-12 Shibuya, Tokyo 150-6145, Japan' },
  { name: 'Marina Bay Sands Convention Centre', address: '10 Bayfront Ave, Singapore 018956' },
  { name: 'Kenyatta International Convention Centre (KICC)', address: 'Harambee Ave, Nairobi, Kenya' },
  { name: 'Cape Town International Convention Centre (CTICC)', address: 'Convention Square, 1 Lower Long St, Cape Town, South Africa' },
  { name: 'Metro Toronto Convention Centre', address: '255 Front St W, Toronto, ON M5V 2W6, Canada' },
  { name: 'Silicon Valley Innovation Hub', address: '300 S 1st St, San Jose, CA 95113, United States' },
  { name: 'SXSW Conference Headquarters', address: 'Austin Convention Center, Austin, TX, USA' },
  { name: 'Royal Albert Hall', address: 'Kensington Gore, South Kensington, London SW7 2AP, UK' },
  { name: 'Wembley O2 Arena', address: 'Arena Square, Engineers Way, London HA9 0AA, UK' },
  { name: 'Tobacco Dock Creative Events Space', address: 'Tobacco Quay, Wapping Lane, London E1W 2SF, UK' },
  { name: 'National Exhibition Centre (NEC)', address: 'North Ave, Marston Green, Birmingham B40 1NT, UK' },
  { name: 'The Roundhouse Workspace', address: 'Chalk Farm Rd, London NW1 8EH, United Kingdom' },
  { name: 'Digital Catapult Centre', address: '101 Euston Rd, London NW1 2RA, United Kingdom' },
  { name: 'Kigali Convention Centre', address: 'KG 2 Roundabout, Kigali, Rwanda' },
  { name: 'International Conference Centre Abuja', address: 'Herbert Macaulay Way, Central Business District, Abuja, Nigeria' },
  { name: 'Muson Centre', address: '8/12 Marina, Lagos Island, Lagos, Nigeria' },
];

export default function MapVenueInput({ value, onChange, brandColor = '#6C47FF' }: MapVenueInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredVenues, setFilteredVenues] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal input state with outer form values
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle autocomplete query fetching from dynamic free geocoding API with fallbacks
  useEffect(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setFilteredVenues(VENUE_PRESETS.slice(0, 5));
      return;
    }

    // Skip redundant network searches when selection is locked
    const isExactPreset = VENUE_PRESETS.some(
      (p) => `${p.name}, ${p.address}` === trimmed || p.name === trimmed
    );
    if (isExactPreset || trimmed === value) {
      return;
    }

    setLoading(true);
    const controller = new AbortController();

    const fetchTimer = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=6&addressdetails=1`,
        {
          signal: controller.signal,
          headers: {
            'Accept-Language': 'en'
          }
        }
      )
        .then((res) => {
          if (!res.ok) throw new Error('Geocoding search failed');
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const mappedResults: LocationResult[] = data.map((item: any) => {
              const displayName = item.display_name || '';
              const parts = displayName.split(',');
              const mainName = parts[0]?.trim() || 'Place';
              const secondaryAddress = parts.slice(1).map((p: string) => p.trim()).join(', ');
              return {
                name: mainName,
                address: secondaryAddress || 'Global Coordinates'
              };
            });
            setFilteredVenues(mappedResults);
          } else {
            // Local fallback filter if search matches nothing on geocoder API
            const searchStr = trimmed.toLowerCase();
            const matched = VENUE_PRESETS.filter(
              (v) =>
                v.name.toLowerCase().includes(searchStr) ||
                v.address.toLowerCase().includes(searchStr)
            );
            setFilteredVenues(matched);
          }
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          console.warn('Geocoding API failed, falling back to local preset list', err);
          // Offline fallback
          const searchStr = trimmed.toLowerCase();
          const matched = VENUE_PRESETS.filter(
            (v) =>
              v.name.toLowerCase().includes(searchStr) ||
              v.address.toLowerCase().includes(searchStr)
          );
          setFilteredVenues(matched);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 200); // 200ms debounce to limit flight queries nicely

    return () => {
      clearTimeout(fetchTimer);
      controller.abort();
    };
  }, [inputValue, value]);

  // Close suggestions if clicking elsewhere on screen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setIsDropdownOpen(true);
  };

  const handleSelectVenue = (venueName: string, address: string) => {
    const joinedAddress = address && address !== 'Global Coordinates' ? `${venueName}, ${address}` : venueName;
    setInputValue(joinedAddress);
    onChange(joinedAddress);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative w-full font-sans" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          required
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder="Search full venue name or address..."
          className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/30 text-neutral-900 dark:text-white rounded-xl py-3 pl-4 pr-10 text-sm font-sans placeholder-neutral-400 dark:placeholder-neutral-600 transition-all font-medium border-solid focus:border-[#6C47FF] focus:ring-1 focus:ring-[#6C47FF] outline-none"
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none">
          {loading ? (
            <div className="w-4 h-4 rounded-full border-2 border-neutral-300 border-t-[#6C47FF]/80 dark:border-t-[#8261FF]/80 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* Suggested Locations Dropdown Panel */}
      {isDropdownOpen && filteredVenues.length > 0 && (
        <div className="absolute z-55 w-full mt-1.5 bg-[#FFFFFE] dark:bg-[#1C1C1C] border border-neutral-200 dark:border-white/30 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-neutral-150/40 dark:divide-white/30 overflow-hidden">
          <div className="px-3 py-2 bg-neutral-50/50 dark:bg-neutral-900/40 text-[9px] uppercase font-mono tracking-widest text-[#6C47FF] dark:text-[#8261FF] font-semibold sticky top-0 backdrop-blur border-b border-neutral-150/40 dark:border-white/30">
            Suggested Venues
          </div>
          {filteredVenues.map((v, idx) => (
            <button
              key={`${v.name}-${idx}`}
              type="button"
              onClick={() => handleSelectVenue(v.name, v.address)}
              className="w-full text-left px-4 py-3 text-xs flex items-start gap-2.5 hover:bg-neutral-50 dark:hover:bg-[#252525] transition-all text-neutral-800 dark:text-neutral-200 font-sans cursor-pointer group"
            >
              <MapPin className="w-4 h-4 text-neutral-400 group-hover:text-[#6C47FF] dark:group-hover:text-[#8261FF] mt-0.5 shrink-0 transition-colors" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900 dark:text-white truncate">
                  {v.name}
                </p>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5 font-medium leading-normal">
                  {v.address}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
