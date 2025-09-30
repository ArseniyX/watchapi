import Image from "next/image";

export const Logo = () => {
    return (
        <div className="flex items-center justify-center">
            <Image
                src="/logo.png"
                alt="WatchAPI logo"
                width={40}
                height={40}
                className="shrink-0"
            />
            <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
                WatchAPI
            </span>
        </div>
    );
};
