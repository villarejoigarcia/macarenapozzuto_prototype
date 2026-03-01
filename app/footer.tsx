'use client';

export default function Footer() {

    return (
        <div className={'h-screen flex flex-col gap-[15px] justify-end p-[20px] absolute w-full bottom-0'}>
            <div className="flex w-full justify-between items-end">
                <p className="lg:flex-none flex-1">© 2026</p>
                <div className="flex justify-between lg:flex-none flex-[2.15]">
                    {/* <div className="flex">
                        <p className="mr-[1em]">Email</p>
                        <p>Instagram</p>
                    </div> */}
                    <p>Independent graphic designer from Argentina based in Barcelona</p>
                </div>
            </div>
            <svg viewBox="0 0 1888 553" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 552.72V0H83.79L266.07 458.64L445.41 0H529.2V552.72H463.05V127.89L296.94 552.72H235.2L66.15 127.89V552.72H0Z" fill="white" />
                <path d="M584.842 552.72V0H809.017C916.327 0 986.152 66.885 986.152 157.29C986.152 248.43 915.592 316.05 809.017 316.05H651.727V552.72H584.842ZM651.727 250.635H808.282C874.432 250.635 917.797 213.885 917.797 157.29C917.797 100.695 875.167 65.415 808.282 65.415H651.727V250.635Z" fill="white" />
                <path d="M1007.93 552.72V507.885L1329.12 65.415H1012.34V0H1423.2V49.245L1103.48 486.57H1423.2V552.72H1007.93Z" fill="white" />
                <path d="M1471.81 552.72V507.885L1793 65.415H1476.22V0H1887.08V49.245L1567.36 486.57H1887.08V552.72H1471.81Z" fill="white" />
            </svg>
        </div>
    );
}