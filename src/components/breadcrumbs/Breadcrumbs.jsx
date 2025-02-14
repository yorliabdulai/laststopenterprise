import React from "react";
import { Link, NavLink } from "react-router-dom";



/**
 * The Breadcrumbs component renders a section with a Home link and
 * a link for each of the `type`, `checkout`, and `stripe` props.
 * If a prop is not provided, the corresponding link will not be rendered.
 * Each link is rendered with a bold font and a font size of xl or 3xl.
 * Each link is also given a class of "text-secondary-content" if the link is active.
 * The links are separated by a slash.
 * The section is given a background color of primary-content and a min height of 20px on mobile and 36px on desktop.
 * The section is also given a flexbox layout with the links centered horizontally.
 * The section is given a max width of 1200px and is centered horizontally on desktop.
 * The section is given a padding of 2px on mobile and 6px on desktop.
 */
const Breadcrumbs = ({ type, checkout, stripe }) => {
	const activeLink = ({ isActive }) => (isActive ? "text-secondary-content " : null);

	return (
		<section className="h-20 md:h-36 w-full bg-primary-content flex items-center">
			<div className="w-full mx-auto px-2 lg:w-9/12 md:px-6 ">
				<Link to="/" className="text-xl md:text-3xl font-bold ">
					Home /
				</Link>
				<NavLink to="/all" className={activeLink}>
					<span className="text-xl md:text-3xl font-bold"> Products </span>
				</NavLink>

				{type && (
					<NavLink to={{}} className={activeLink}>
						<span className="text-xl md:text-3xl font-bold">/ {type}</span>
					</NavLink>
				)}
				{checkout && (
					<NavLink to={{}} className={activeLink}>
						<span className="text-xl md:text-3xl font-bold"> / {checkout}</span>
					</NavLink>
				)}
				{stripe && (
					<NavLink to={{}} className={activeLink}>
						<span className="text-xl md:text-3xl font-bold"> / {stripe}</span>
					</NavLink>
				)}
			</div>
		</section>
	);
};

export default Breadcrumbs;
