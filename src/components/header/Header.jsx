import React from "react";

/**
 * A Header component that renders a section with a background color and a centered heading element.
 * The heading element will display the text passed as a prop.
 * The component is responsive and will adjust the font size and padding based on screen size.
 * @param {string} text - The text to be displayed in the heading element.
 * @returns {ReactElement} - The Header component.
 */
const Header = ({ text }) => {
	return (
		<section className="h-20 md:h-36 w-full bg-primary-content flex items-center">
			<div className="w-full mx-auto px-2 lg:w-9/12 md:px-6 ">
				<h1 className="text-xl md:text-3xl font-bold text-secondary-content">{text}</h1>
			</div>
		</section>
	);
};

export default Header;
