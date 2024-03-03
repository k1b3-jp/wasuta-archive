import { faSquareXTwitter } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React from "react";
import Logo from "../../../public/logo.svg";

const Footer: React.FC = () => {
	return (
		<footer className="mb-[73px] bg-light-black shadow text-light-gray">
			<div className="w-full max-w-screen-lg mx-auto p-4 md:py-8">
				<div className="sm:flex sm:items-center sm:justify-between">
					<Link href="/" className="my-2 mr-4 ml-2 inline-flex items-center">
						<Logo width={50} height={50} />
					</Link>
					<ul className="flex flex-wrap items-center mb-6 text-sm font-medium  sm:mb-0">
						<li>
							<Link href="/policy" className="hover:underline me-4 md:me-6">
								Privacy Policy
							</Link>
						</li>
						<li>
							<Link href="/terms" className="hover:underline me-4 md:me-6">
								Terms
							</Link>
						</li>
						<li>
							<Link href="/form" className="hover:underline">
								Contact
							</Link>
						</li>
					</ul>
				</div>
				<hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
				<div className="sm:flex sm:items-center sm:justify-between">
					<span className="block text-sm  sm:text-center">
						© 2024{" "}
						<a href="https://github.com/k1b3-jp" className="hover:underline">
							k1b3-jp
						</a>
						. All Rights Reserved.
					</span>
					<div className="flex mt-4 sm:justify-center sm:mt-0">
						<Link href="https://twitter.com/tws_kotaro">
							<FontAwesomeIcon icon={faSquareXTwitter} className="text-2xl" />
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
