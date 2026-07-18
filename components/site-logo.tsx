import Image from "next/image";

const ASPECT = 1050 / 330;

export function SiteLogo({
  height = 36,
  className = "",
  priority = false,
}: {
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  const width = Math.round(height * ASPECT);
  const sizeClass = className || "w-auto";

  return (
    <>
      <Image
        src="/assets/logo-dark.png"
        alt="HD Wallpapers"
        width={width}
        height={height}
        className={`site-logo site-logo-dark ${sizeClass}`}
        priority={priority}
      />
      <Image
        src="/assets/logo-light.png"
        alt="HD Wallpapers"
        width={width}
        height={height}
        className={`site-logo site-logo-light ${sizeClass}`}
        priority={priority}
      />
    </>
  );
}
