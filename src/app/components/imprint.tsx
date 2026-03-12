'use client';

export default function Imprint() {

    return (
        <div className="flex flex-wrap w-full justify-between w-full">

            <div className="flex flex-1 gap-x-1">
                <p className="lg:flex-1">© 2026</p>
                <p className="lg:flex-1">All rights reserved</p>
            </div>

            <div className="flex gap-x-1 flex-1 lg:justify-start justify-end">
                <p>Barcelona, Spain,</p>
                <p>11:45</p>
            </div>

            <div className="flex lg:flex-row flex-col lg:flex-1 items-center justify-end lg:order-none order-last w-full">
                <p>Design by Alex Villarejo & Macarena Pozzuto</p>
                <p className="lg:before:content-['/'] lg:before:px-1">Code by Alex Villarejo</p>
            </div>

        </div>
    );
}