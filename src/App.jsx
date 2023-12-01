import React from "react";

export default function App() {
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

	return <>
		<h1>mini lotto</h1>
		<LottoResult result={drawNumbers(1, 20, 4)}/>
	</>;
}

function LottoResult({result}) {
	return <div className="results">
		{result.map((number, index) => <LottoBall key={index} value={number}/>)}
	</div>;
}

function LottoBall({value}) {
	return <div className="ball">{value}</div>;
}
