import React from "react";

export default function App() {
	return <h1>mini lotto</h1>;
}

function drawNumbers(start, end, n) {
	let pool = [];
	for (let i = start; i <= end; i++) {
		pool.push(i);
	}

	let drawn = [];
	for (let i = 0; i < n; i++) {
		let index = Math.floor(Math.random() * pool.length);
		drawn.push(pool[index]);
		pool.splice(index, 1);
	}

	return drawn;
}
