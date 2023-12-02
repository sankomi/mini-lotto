import React, {useState} from "react";

export default function App() {
	const [drawNumber, setDrawNumber] = useState(1);
	const [results, setResults] = useState([]);
	const [tickets, setTickets] = useState([]);

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

		setDrawNumber(drawNumber + 1);
		setResults([...results, {drawNumber, numbers: drawn}]);
	}

	function addRandomTicket(drawNumber, start, end, n) {
		let ticket = {
			drawNumber,
			numbers: [],
		};

		let pool = [];
		for (let i = start; i <= end; i++) {
			pool.push(i);
		}

		for (let i = 0; i < n; i++) {
			let index = Math.floor(Math.random() * pool.length);
			ticket.numbers.push(pool[index]);
			pool.splice(index, 1);
		}

		setTickets([...tickets, ticket]);
	}

	return <>
		<h1>mini lotto</h1>
		<button onClick={() => drawNumbers(1, 20, 4)}>check</button>
		<LottoResult result={results.length > 0? results[results.length - 1]: null}/>
		<TicketList tickets={tickets}/>
		<button onClick={() => addRandomTicket(drawNumber, 1, 20, 4)}>add</button>
	</>;
}

function TicketList({tickets}) {
	return <>
		<h2>tickets</h2>
		<ul className="tickets">
			{tickets.map((ticket, index) => <TicketItem key={index} ticket={ticket}/>)}
		</ul>
	</>;
}

function TicketItem({ticket}) {
	return <li className="ticket">
		<div>draw number {ticket.drawNumber}</div>
		<div className="balls">
			{ticket.numbers.map((number, index) => <LottoBall key={index} value={number}/>)}
		</div>
	</li>;
}

function LottoResult({result}) {
	if (!result) {
		return <></>;
	}

	return <>
		<div>draw number {result.drawNumber}</div>
		<div className="results balls">
			{result.numbers.map((number, index) => <LottoBall key={index} value={number}/>)}
		</div>
	</>;
}

function LottoBall({value}) {
	return <div className="ball">{value}</div>;
}
