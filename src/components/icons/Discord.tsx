import type { SVGProps } from "react";

export const DiscordIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M6 20c2.5 1 5.5 1 8 0 0 0 .4-.7 1-1 1 .4 2 .7 3 1 1.5-2.5 2-5 1.8-7.5C19.7 8 17 5 13.5 4.5c-.2 0-.4.1-.5.3-.1.4-.2.7-.3 1-1-.2-2-.2-3 0-.1-.3-.2-.7-.3-1a.5.5 0 0 0-.6-.3C5 5 2.3 8 2.1 12.5 2 15 2.5 17.5 4 20c1-.3 2-.6 3-1 .6.3 1 .9 1 1Z"
      />
      <path d="M9 12.5h0" />
      <path d="M15 12.5h0" />
    </svg>
  );
};
