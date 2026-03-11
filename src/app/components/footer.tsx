'use client';

export default function Footer() {

    return (
        <div className={'lg:h-screen h-fit flex flex-col justify-end p-[10px] w-full'}>
        {/* <div className={'h-fit flex flex-col justify-end p-[10px] w-full'}> */}
            <div className="sticky bottom-[10px]">
                <svg viewBox="0 0 1888 553" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 552.72V0H83.79L266.07 458.64L445.41 0H529.2V552.72H463.05V127.89L296.94 552.72H235.2L66.15 127.89V552.72H0Z" />
                    <path d="M584.842 552.72V0H809.017C916.327 0 986.152 66.885 986.152 157.29C986.152 248.43 915.592 316.05 809.017 316.05H651.727V552.72H584.842ZM651.727 250.635H808.282C874.432 250.635 917.797 213.885 917.797 157.29C917.797 100.695 875.167 65.415 808.282 65.415H651.727V250.635Z" />
                    <path d="M1007.93 552.72V507.885L1329.12 65.415H1012.34V0H1423.2V49.245L1103.48 486.57H1423.2V552.72H1007.93Z" />
                    <path d="M1471.81 552.72V507.885L1793 65.415H1476.22V0H1887.08V49.245L1567.36 486.57H1887.08V552.72H1471.81Z" />
                </svg>
                <div className="flex flex-wrap w-full justify-between w-full pt-[15px]">

                    <p className="flex-1">© 2026 All rights reserved</p>

                    <div className="flex lg:flex-row flex-col lg:flex-1 items-center justify-center lg:order-none order-last w-full">
                        <p>Design by Alex Villarejo & Macarena Pozzuto</p>
                        <p className="lg:before:content-['/'] lg:before:px-1">Code by Alex Villarejo</p>
                    </div>

                    <div className="flex gap-1 flex-1 justify-end">
                        <p>Barcelona, Spain,</p>
                        <p>11:45</p>
                    </div>

                </div>
            </div>
        </div>
    );
}