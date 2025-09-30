import Image from "next/image";

export const Logo = () => {
    return (
        <div className="flex items-center justify-center space-x-2">
            <Image src={"/logo.png"} alt="logo" width={40} height={40} />
            <span className="font-semibold text-lg">WatchAPI</span>
        </div>
    );
};
