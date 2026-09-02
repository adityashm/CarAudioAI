import React from 'react';
import Svg, {
  Path,
  G,
  Circle,
  Rect,
  Polygon,
  Ellipse,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

export interface CarBrandLogoProps {
  makeId: string;
  size?: number;
  color?: string;
  isSelected?: boolean;
}

export const CarBrandLogo: React.FC<CarBrandLogoProps> = ({
  makeId,
  size = 32,
  color,
  isSelected = false,
}) => {
  const normalizedId = makeId?.toLowerCase().trim() || '';
  const defaultWhite = isSelected ? '#ffffff' : (color || '#cbd5e1');

  switch (normalizedId) {
    // -------------------------------------------------------------
    // ŠKODA (Winged Arrow with Plumage in Circle)
    // -------------------------------------------------------------
    case 'skoda':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Circle cx="50" cy="50" r="44" stroke={color || '#4ade80'} strokeWidth="5" />
          <Circle cx="40" cy="38" r="4" fill={color || '#4ade80'} />
          <Path
            d="M32 50 C38 42 50 36 68 32 C62 44 56 50 48 56 C56 58 64 56 74 52 C65 62 55 68 40 70 C46 64 48 58 46 54 Z"
            fill={color || '#4ade80'}
          />
          <Path d="M46 54 L24 64 L30 52 Z" fill={color || '#4ade80'} />
        </Svg>
      );

    // -------------------------------------------------------------
    // MARUTI SUZUKI (Stylized 'S' Katana Emblem)
    // -------------------------------------------------------------
    case 'maruti':
    case 'suzuki':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Defs>
            <LinearGradient id="suzukiGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#38bdf8" />
              <Stop offset="100%" stopColor="#0284c7" />
            </LinearGradient>
          </Defs>
          <Path
            d="M22 20 L78 20 L40 50 L78 50 L64 64 L22 64 L56 34 L22 34 Z"
            fill="url(#suzukiGrad)"
          />
          <Path
            d="M78 80 L22 80 L60 50 L22 50 L36 36 L78 36 L44 66 L78 66 Z"
            fill={isSelected ? '#ffffff' : '#38bdf8'}
            opacity={0.9}
          />
        </Svg>
      );

    // -------------------------------------------------------------
    // HYUNDAI (Fluid Slanted Handshake 'H' in Ellipse)
    // -------------------------------------------------------------
    case 'hyundai':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Ellipse
            cx="50"
            cy="50"
            rx="45"
            ry="34"
            stroke={color || '#60a5fa'}
            strokeWidth="5"
            transform="rotate(-10 50 50)"
          />
          <Path
            d="M34 68 C38 52 42 38 46 26 C43 27 38 34 33 46 Z"
            fill={color || '#60a5fa'}
          />
          <Path
            d="M66 26 C62 42 58 56 54 68 C57 67 62 60 67 48 Z"
            fill={color || '#60a5fa'}
          />
          <Path
            d="M38 48 C46 44 54 44 62 48 C56 52 48 52 38 48 Z"
            fill={color || '#60a5fa'}
          />
        </Svg>
      );

    // -------------------------------------------------------------
    // TATA MOTORS (Tata Fluid 'T' Wings)
    // -------------------------------------------------------------
    case 'tata':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Circle cx="50" cy="50" r="44" stroke={color || '#a855f7'} strokeWidth="4.5" />
          <Path
            d="M50 32 C38 42 32 58 36 72 C42 60 46 48 50 32 Z"
            fill={color || '#a855f7'}
          />
          <Path
            d="M50 32 C62 42 68 58 64 72 C58 60 54 48 50 32 Z"
            fill={color || '#a855f7'}
          />
          <Path d="M47 38 L53 38 L52 74 L48 74 Z" fill={color || '#a855f7'} />
        </Svg>
      );

    // -------------------------------------------------------------
    // MAHINDRA (Modern Twin Peaks 'M' Infinity Emblem)
    // -------------------------------------------------------------
    case 'mahindra':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Defs>
            <LinearGradient id="mahindraGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#fb923c" />
              <Stop offset="100%" stopColor="#ea580c" />
            </LinearGradient>
          </Defs>
          <Path
            d="M18 68 C24 46 36 28 48 24 C45 38 38 56 28 72 Z"
            fill="url(#mahindraGrad)"
          />
          <Path
            d="M82 68 C76 46 64 28 52 24 C55 38 62 56 72 72 Z"
            fill="url(#mahindraGrad)"
          />
          <Path
            d="M48 24 L50 42 L52 24 C56 36 60 52 64 68 L50 56 L36 68 C40 52 44 36 48 24 Z"
            fill="#ffffff"
            opacity={0.85}
          />
        </Svg>
      );

    // -------------------------------------------------------------
    // TOYOTA (Three Interlocking Ellipses)
    // -------------------------------------------------------------
    case 'toyota':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Ellipse cx="50" cy="50" rx="44" ry="32" stroke={color || '#ef4444'} strokeWidth="5" />
          <Ellipse cx="50" cy="46" rx="14" ry="24" stroke={color || '#ef4444'} strokeWidth="4.5" />
          <Ellipse cx="50" cy="38" rx="28" ry="12" stroke={color || '#ef4444'} strokeWidth="4.5" />
        </Svg>
      );

    // -------------------------------------------------------------
    // KIA (Modern Angular Connected KIA Wordmark)
    // -------------------------------------------------------------
    case 'kia':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Path
            d="M16 70 L26 30 L36 70 M26 48 L46 70 L46 30 M54 30 L54 70 M54 30 L84 30 L84 70"
            stroke={color || '#ec4899'}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    // -------------------------------------------------------------
    // VOLKSWAGEN (Joined 'V' and 'W' in Circle)
    // -------------------------------------------------------------
    case 'vw':
    case 'volkswagen':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Circle cx="50" cy="50" r="44" stroke={color || '#0284c7'} strokeWidth="4.5" />
          <Path d="M30 30 L50 56 L70 30" stroke={color || '#0284c7'} strokeWidth="4.5" strokeLinecap="round" />
          <Path d="M24 46 L38 74 L50 54 L62 74 L76 46" stroke={color || '#0284c7'} strokeWidth="4.5" strokeLinecap="round" />
        </Svg>
      );

    // -------------------------------------------------------------
    // HONDA (Squared Trapezoid Chrome 'H')
    // -------------------------------------------------------------
    case 'honda':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Rect
            x="14"
            y="18"
            width="72"
            height="64"
            rx="12"
            stroke={color || '#10b981'}
            strokeWidth="5"
          />
          <Path
            d="M32 26 L38 72 M68 26 L62 72 M34 50 L66 50"
            stroke={color || '#10b981'}
            strokeWidth="6"
            strokeLinecap="round"
          />
        </Svg>
      );

    // -------------------------------------------------------------
    // MG MOTOR (Classic Octagonal Badge)
    // -------------------------------------------------------------
    case 'mg':
    case 'mg_motor':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Polygon
            points="30,12 70,12 88,30 88,70 70,88 30,88 12,70 12,30"
            stroke={color || '#e11d48'}
            strokeWidth="5"
          />
          <Polygon
            points="32,18 68,18 82,32 82,68 68,82 32,82 18,68 18,32"
            stroke={color || '#e11d48'}
            strokeWidth="2"
          />
          <Path
            d="M26 66 L26 34 L36 52 L46 34 L46 66"
            stroke={color || '#e11d48'}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M74 42 C70 36 60 36 56 42 C52 48 52 56 56 62 C60 68 72 68 74 60 L64 60"
            stroke={color || '#e11d48'}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </Svg>
      );

    // -------------------------------------------------------------
    // RENAULT (Geometric Diamond / Losange)
    // -------------------------------------------------------------
    case 'renault':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Polygon
            points="50,12 84,50 50,88 16,50"
            stroke={color || '#facc15'}
            strokeWidth="5"
          />
          <Polygon
            points="50,28 70,50 50,72 30,50"
            stroke={color || '#facc15'}
            strokeWidth="3.5"
          />
          <Polygon
            points="50,38 60,50 50,62 40,50"
            fill={isSelected ? '#0e121a' : '#06080d'}
          />
        </Svg>
      );

    // -------------------------------------------------------------
    // NISSAN (Ring with Horizontal Bar)
    // -------------------------------------------------------------
    case 'nissan':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Circle cx="50" cy="50" r="42" stroke={color || '#94a3b8'} strokeWidth="4.5" />
          <Rect
            x="10"
            y="42"
            width="80"
            height="16"
            rx="3"
            fill={isSelected ? '#0e121a' : '#06080d'}
            stroke={color || '#94a3b8'}
            strokeWidth="4"
          />
          <Path
            d="M24 53 L24 47 L30 53 L30 47 M36 47 L36 53 M42 47 C44 47 46 48 44 50 C42 52 46 53 46 53 M52 47 C54 47 56 48 54 50 C52 52 56 53 56 53 M62 53 L66 47 L70 53 M64 51 L68 51 M76 53 L76 47 L82 53 L82 47"
            stroke={color || '#94a3b8'}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </Svg>
      );

    // -------------------------------------------------------------
    // JEEP (7-Slot Grille & Headlights)
    // -------------------------------------------------------------
    case 'jeep':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Circle cx="16" cy="50" r="10" stroke={color || '#84cc16'} strokeWidth="4" />
          <Circle cx="84" cy="50" r="10" stroke={color || '#84cc16'} strokeWidth="4" />
          {[30, 36, 42, 48, 54, 60, 66].map((x, idx) => (
            <Rect
              key={idx}
              x={x}
              y="34"
              width="4.5"
              height="32"
              rx="2.2"
              fill={color || '#84cc16'}
            />
          ))}
          <Rect
            x="26"
            y="28"
            width="48"
            height="44"
            rx="6"
            stroke={color || '#84cc16'}
            strokeWidth="3.5"
          />
        </Svg>
      );

    // -------------------------------------------------------------
    // BMW (Bavarian Propeller Roundel)
    // -------------------------------------------------------------
    case 'bmw':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Circle cx="50" cy="50" r="44" stroke="#60a5fa" strokeWidth="4" />
          <Circle cx="50" cy="50" r="30" stroke="#ffffff" strokeWidth="2" />
          <Path d="M50 50 L50 20 A30 30 0 0 0 20 50 Z" fill="#ffffff" />
          <Path d="M50 50 L80 50 A30 30 0 0 0 50 20 Z" fill="#0284c7" />
          <Path d="M50 50 L20 50 A30 30 0 0 0 50 80 Z" fill="#0284c7" />
          <Path d="M50 50 L50 80 A30 30 0 0 0 80 50 Z" fill="#ffffff" />
        </Svg>
      );

    // -------------------------------------------------------------
    // MERCEDES-BENZ (Three-Pointed Star in Ring)
    // -------------------------------------------------------------
    case 'mercedes':
    case 'mercedes-benz':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Circle cx="50" cy="50" r="44" stroke={color || '#cbd5e1'} strokeWidth="4" />
          <Polygon points="50,50 47,48 50,10 53,48" fill={color || '#cbd5e1'} />
          <Polygon points="50,50 51,53 16,74 46,47" fill={color || '#cbd5e1'} />
          <Polygon points="50,50 54,47 84,74 49,53" fill={color || '#cbd5e1'} />
          <Circle cx="50" cy="50" r="3" fill={color || '#cbd5e1'} />
        </Svg>
      );

    // -------------------------------------------------------------
    // AUDI (Four Interlocking Rings)
    // -------------------------------------------------------------
    case 'audi':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Circle cx="23" cy="50" r="16" stroke={color || '#f1f5f9'} strokeWidth="3.5" />
          <Circle cx="41" cy="50" r="16" stroke={color || '#f1f5f9'} strokeWidth="3.5" />
          <Circle cx="59" cy="50" r="16" stroke={color || '#f1f5f9'} strokeWidth="3.5" />
          <Circle cx="77" cy="50" r="16" stroke={color || '#f1f5f9'} strokeWidth="3.5" />
        </Svg>
      );

    // -------------------------------------------------------------
    // VOLVO (Iron Mark with Diagonal Arrow)
    // -------------------------------------------------------------
    case 'volvo':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Circle cx="46" cy="54" r="34" stroke={color || '#38bdf8'} strokeWidth="4.5" />
          <Path d="M68 32 L84 16 M84 16 L70 16 M84 16 L84 30" stroke={color || '#38bdf8'} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <Rect x="18" y="46" width="56" height="16" rx="2" fill="#0284c7" />
          <Path d="M26 58 L30 50 L34 58 M40 50 C44 50 46 52 46 54 C46 56 44 58 40 58 L38 58 L38 50 M52 50 L52 58 M58 58 L62 50 L66 58" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );

    // -------------------------------------------------------------
    // BYD (Stadium Oval with BYD Mark)
    // -------------------------------------------------------------
    case 'byd':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Rect x="8" y="24" width="84" height="52" rx="26" stroke={color || '#2dd4bf'} strokeWidth="4.5" />
          <Path d="M24 38 L34 38 C38 38 40 40 40 43 C40 46 38 47 34 47 L24 47 M24 47 L36 47 C40 47 42 49 42 53 C42 57 39 59 34 59 L24 59 L24 38" stroke={color || '#2dd4bf'} strokeWidth="3.5" strokeLinecap="round" />
          <Path d="M46 38 L52 48 L58 38 M52 48 L52 59" stroke={color || '#2dd4bf'} strokeWidth="3.5" strokeLinecap="round" />
          <Path d="M64 38 L72 38 C78 38 82 42 82 48 C82 54 78 59 72 59 L64 59 L64 38" stroke={color || '#2dd4bf'} strokeWidth="3.5" strokeLinecap="round" />
        </Svg>
      );

    // -------------------------------------------------------------
    // LAND ROVER (British Racing Green Oval & Silver Script)
    // -------------------------------------------------------------
    case 'landrover':
    case 'land_rover':
    case 'range_rover':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Ellipse cx="50" cy="50" rx="46" ry="28" fill="#064e3b" stroke={color || '#10b981'} strokeWidth="3.5" />
          <Ellipse cx="50" cy="50" rx="41" ry="23" stroke="#34d399" strokeWidth="1.2" />
          <Path d="M16 50 L26 44 L26 56 Z" fill="#ffffff" />
          <Path d="M84 50 L74 44 L74 56 Z" fill="#ffffff" />
          <Path d="M30 46 L38 46 M34 46 L34 54 M44 46 L44 54 M52 46 L52 54 M60 46 L68 46" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );

    // -------------------------------------------------------------
    // PORSCHE (Stuttgart Crest Shield)
    // -------------------------------------------------------------
    case 'porsche':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Path
            d="M20 20 L80 20 L80 50 C80 72 50 88 50 88 C50 88 20 72 20 50 Z"
            fill="#d97706"
            stroke="#fbbf24"
            strokeWidth="3.5"
          />
          <Path d="M26 34 L74 34 M26 44 L74 44" stroke="#000000" strokeWidth="3" />
          <Path d="M26 38 L74 38" stroke="#dc2626" strokeWidth="3" />
          <Path d="M40 42 L60 42 L60 58 C60 68 50 74 50 74 C50 74 40 68 40 58 Z" fill="#fbbf24" />
          <Path d="M50 48 C48 46 48 52 51 54 C53 56 49 62 52 64" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );

    // -------------------------------------------------------------
    // FORD (Classic Oval)
    // -------------------------------------------------------------
    case 'ford':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Ellipse cx="50" cy="50" rx="46" ry="26" fill="#1e3a8a" stroke={color || '#60a5fa'} strokeWidth="4" />
          <Ellipse cx="50" cy="50" rx="40" ry="20" stroke="#ffffff" strokeWidth="1.5" />
          <Path
            d="M26 56 C28 42 38 40 44 44 C38 48 34 58 32 60 M38 50 L48 50 M48 48 C52 46 56 46 58 52 C62 48 68 48 72 54"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </Svg>
      );

    // -------------------------------------------------------------
    // CITROËN (Double Chevron Gear Teeth)
    // -------------------------------------------------------------
    case 'citroen':
    case 'citroën':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Path
            d="M20 44 L50 20 L80 44 L70 50 L50 34 L30 50 Z"
            fill={color || '#f43f5e'}
          />
          <Path
            d="M20 72 L50 48 L80 72 L70 78 L50 62 L30 78 Z"
            fill={color || '#f43f5e'}
          />
        </Svg>
      );

    // -------------------------------------------------------------
    // FORCE MOTORS (Dual Mountain Shield / Chevron)
    // -------------------------------------------------------------
    case 'force':
    case 'force_motors':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Circle cx="50" cy="50" r="44" stroke={color || '#ea580c'} strokeWidth="4.5" />
          <Path
            d="M24 64 L50 30 L76 64 L66 68 L50 44 L34 68 Z"
            fill={color || '#ea580c'}
          />
          <Path
            d="M38 72 L50 54 L62 72 L56 74 L50 64 L44 74 Z"
            fill="#ffffff"
          />
        </Svg>
      );

    // -------------------------------------------------------------
    // LEXUS (Fluid 'L' in Ellipse)
    // -------------------------------------------------------------
    case 'lexus':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Ellipse cx="50" cy="50" rx="44" ry="32" stroke={color || '#94a3b8'} strokeWidth="4.5" />
          <Path
            d="M68 28 L42 58 C38 62 38 66 42 66 L72 66"
            stroke={color || '#94a3b8'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    // -------------------------------------------------------------
    // JAGUAR (Leaping Silhouette / Leaper)
    // -------------------------------------------------------------
    case 'jaguar':
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Path
            d="M16 62 C22 52 32 46 44 48 C52 50 62 44 72 38 C78 34 84 36 86 40 C84 44 78 46 72 50 C66 54 58 56 50 56 C44 56 38 60 30 66 C24 70 18 68 16 62 Z"
            fill={color || '#cbd5e1'}
          />
          <Path
            d="M74 50 L84 56 L78 60 M48 56 L42 68 M36 62 L26 74"
            stroke={color || '#cbd5e1'}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </Svg>
      );

    // -------------------------------------------------------------
    // DEFAULT GENERIC BADGE FALLBACK
    // -------------------------------------------------------------
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <Circle cx="50" cy="50" r="42" stroke={defaultWhite} strokeWidth="4" strokeDasharray="6 4" />
          <Path
            d="M32 50 L50 32 L68 50 L50 68 Z"
            stroke={defaultWhite}
            strokeWidth="4"
          />
        </Svg>
      );
  }
};

export default CarBrandLogo;
