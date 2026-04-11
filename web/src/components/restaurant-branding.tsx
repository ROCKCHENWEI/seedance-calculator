import type { CSSProperties, SVGProps } from "react";

export type RestaurantTheme = {
  accent: string;
  accentSoft: string;
  badge: string;
  code: string;
};

const DEFAULT_THEME: RestaurantTheme = {
  accent: "#00f5ff",
  accentSoft: "#083a44",
  badge: "Dining Skill",
  code: "STB",
};

export function getRestaurantTheme(name: string): RestaurantTheme {
  if (name.includes("金谷园")) {
    return {
      accent: "#ff3b30",
      accentSoft: "#4f0702",
      badge: "Dumpling Skill",
      code: "JGY",
    };
  }

  if (name.includes("Hotpot")) {
    return {
      accent: "#ff5a36",
      accentSoft: "#4f1205",
      badge: "Heat Signal",
      code: "HOT",
    };
  }

  if (name.includes("Bento")) {
    return {
      accent: "#ffe500",
      accentSoft: "#4e4500",
      badge: "Fast Bento",
      code: "BOX",
    };
  }

  if (name.includes("Noodle")) {
    return {
      accent: "#00f5ff",
      accentSoft: "#063b44",
      badge: "Broth Lab",
      code: "NDL",
    };
  }

  return DEFAULT_THEME;
}

export function restaurantThemeVars(theme: RestaurantTheme): CSSProperties {
  return {
    "--restaurant-accent": theme.accent,
    "--restaurant-accent-soft": theme.accentSoft,
  } as CSSProperties;
}

type LogoProps = SVGProps<SVGSVGElement> & {
  name: string;
};

export function RestaurantLogo({ name, ...props }: LogoProps) {
  if (name.includes("Hotpot")) return <HotpotLogo {...props} />;
  if (name.includes("Bento")) return <BentoLogo {...props} />;
  if (name.includes("金谷园")) return <DumplingLogo {...props} />;
  return <NoodleLogo {...props} />;
}

function LogoBase(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
      {...props}
    />
  );
}

function NoodleLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <LogoBase {...props}>
      <rect x="10" y="34" width="44" height="10" fill="currentColor" />
      <rect x="14" y="44" width="36" height="6" fill="#ffffff" />
      <rect x="20" y="24" width="22" height="4" fill="#ffffff" />
      <rect x="18" y="18" width="4" height="18" fill="currentColor" />
      <rect x="42" y="14" width="4" height="22" fill="currentColor" />
      <rect x="24" y="28" width="4" height="8" fill="#ffffff" />
      <rect x="30" y="28" width="4" height="8" fill="#ffffff" />
      <rect x="36" y="28" width="4" height="8" fill="#ffffff" />
    </LogoBase>
  );
}

function HotpotLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <LogoBase {...props}>
      <rect x="12" y="26" width="40" height="18" fill="currentColor" />
      <rect x="18" y="20" width="28" height="6" fill="#ffffff" />
      <rect x="8" y="30" width="4" height="12" fill="#ffffff" />
      <rect x="52" y="30" width="4" height="12" fill="#ffffff" />
      <rect x="18" y="44" width="6" height="8" fill="#ffffff" />
      <rect x="40" y="44" width="6" height="8" fill="#ffffff" />
      <rect x="28" y="10" width="8" height="6" fill="currentColor" />
      <rect x="24" y="16" width="16" height="6" fill="#ffffff" />
      <rect x="28" y="22" width="8" height="6" fill="currentColor" />
    </LogoBase>
  );
}

function BentoLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <LogoBase {...props}>
      <rect x="12" y="14" width="40" height="36" fill="currentColor" />
      <rect x="18" y="20" width="12" height="10" fill="#ffffff" />
      <rect x="34" y="20" width="12" height="10" fill="#ffffff" />
      <rect x="18" y="34" width="28" height="10" fill="#ffffff" />
      <rect x="16" y="10" width="32" height="4" fill="#ffffff" />
      <rect x="24" y="6" width="16" height="4" fill="currentColor" />
    </LogoBase>
  );
}

function DumplingLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <LogoBase {...props}>
      <rect x="10" y="34" width="44" height="10" fill="currentColor" />
      <rect x="14" y="26" width="12" height="8" fill="#ffffff" />
      <rect x="26" y="22" width="12" height="12" fill="#ffffff" />
      <rect x="38" y="26" width="12" height="8" fill="#ffffff" />
      <rect x="18" y="18" width="4" height="8" fill="currentColor" />
      <rect x="30" y="14" width="4" height="8" fill="currentColor" />
      <rect x="42" y="18" width="4" height="8" fill="currentColor" />
      <rect x="18" y="44" width="28" height="4" fill="#ffffff" />
    </LogoBase>
  );
}
