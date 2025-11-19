import React from "react";
import RootLayout from "../../layout/RootLayout";
import Link from "next/link";
import Image from "next/image";
import { FaInstagram, FaX, FaYoutube } from "react-icons/fa6";
import { FaFacebook } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <div className="w-full h-auto bg-neutral-950 dark:bg-primary py-12">
      <RootLayout className="space-y-10">
        <div className="w-full grid grid-cols-5 gap-8">
          <div className="col-span-2 space-y-8 md:pr-10 pr-0">
            <div className="space-y-3">
              <Link
                href="/"
                className="text-6xl text-primary dark:text-white font-bold"
              >
                Check!tOut
              </Link>
              <p className="text-sm text-neutral-500 dark:text-neutral-200 font-normal">
                Your gateway to unforgettable journeys.
              </p>
            </div>
            {/* Social Link */}
            <div className="w-full flex items-center gap-x-5">
              <div className="w-11 h-11 rounded-xl bg-neutral-800/40 hover:bg-primary dark:hover:bg-secondary flex items-center justify-center cursor-pointer ease-in-out duration-500">
                <FaInstagram className="w-5 h-5 text-neutral-50" />
              </div>
              <div className="w-11 h-11 rounded-xl bg-neutral-800/40 hover:bg-primary dark:hover:bg-secondary flex items-center justify-center cursor-pointer ease-in-out duration-500">
                <FaFacebook className="w-5 h-5 text-neutral-50" />
              </div>
              <div className="w-11 h-11 rounded-xl bg-neutral-800/40 hover:bg-primary dark:hover:bg-secondary flex items-center justify-center cursor-pointer ease-in-out duration-500">
                <FaYoutube className="w-5 h-5 text-neutral-50" />
              </div>
              <div className="w-11 h-11 rounded-xl bg-neutral-800/40 hover:bg-primary dark:hover:bg-secondary flex items-center justify-center cursor-pointer ease-in-out duration-500">
                <FaX className="w-5 h-5 text-neutral-50" />
              </div>
            </div>
          </div>
          <div className="col-span-1 space-y-5">
            <h1 className="text-lg text-neutral-100 font-semibold">
              Quick Links
            </h1>
            <div className="space-y-2">
              <Link
                href="/"
                className="block text-base text-neutral-500 dark:text-neutral-200 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                About Us
              </Link>
              <Link
                href="/"
                className="block text-base text-neutral-500 dark:text-neutral-200 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                My Account
              </Link>
              <Link
                href="/"
                className="block text-base text-neutral-500 dark:text-neutral-200 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                Reserve your ticket
              </Link>
              <Link
                href="/"
                className="block text-base text-neutral-500 dark:text-neutral-200 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                Create your account
              </Link>
            </div>
          </div>
          <div className="col-span-1 space-y-5">
            <h1 className="text-lg text-neutral-100 font-semibold">
              Top Reserve Routes
            </h1>
            <div className="space-y-2">
              <Link
                href="/"
                className="block text-base text-neutral-500 dark:text-neutral-200 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                A - B
              </Link>
              <Link
                href="/"
                className="block text-base text-neutral-500 dark:text-neutral-200 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                A - C
              </Link>
              <Link
                href="/"
                className="block text-base text-neutral-500 dark:text-neutral-200 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                A - C
              </Link>
              <Link
                href="/"
                className="block text-base text-neutral-500 dark:text-neutral-200 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                A - D
              </Link>
            </div>
          </div>
          <div className="col-span-1 space-y-5">
            <h1 className="text-lg text-neutral-100 font-semibold">
              Support Links
            </h1>
            <div className="space-y-2">
              <Link
                href="/"
                className="block text-base text-neutral-500 dark:text-neutral-200 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                href="/"
                className="block text-base text-neutral-500 dark:text-neutral-200 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/"
                className="block text-base text-neutral-500 dark:text-neutral-200 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                Help & Support Center
              </Link>
              <Link
                href="/"
                className="block text-base text-neutral-500 dark:text-neutral-200 hover:text-neutral-300 font-normal ease-in-out duration-300"
              >
                FAQ
              </Link>
            </div>
          </div>
        </div>
        {/* Seperator */}
        <div className="w-full h-px bg-neutral-800/50 dark:bg-secondary/50"></div>
        {/* Copyright */}
        <div className="w-full flex items-center justify-between">
          <p className="text-sm text-neutral-600 dark:text-neutral-200 font-normal">
            © 2025 Check!tOut. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-x-2">
            <Image
              src="/assets/images/mastercard.png"
              alt="MasterCard"
              width={60}
              height={40}
              className="h-9 object-contain object-center"
            />
            <Image
              src="/assets/images/creditcard.png"
              alt="Credit Card"
              width={60}
              height={40}
              className="h-9 object-contain object-center"
            />
            <Image
              src="/assets/images/paypal.png"
              alt="PayPal"
              width={60}
              height={40}
              className="h-9 object-contain object-center"
            />
          </div>
        </div>
      </RootLayout>
    </div>
  );
};

export default Footer;
