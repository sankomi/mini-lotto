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

	function addTicket(numbers) {
		let ticket = {
			drawNumber,
			numbers,
		};

		setTickets([...tickets, ticket]);
	}

	return <>
		<h1>mini lotto</h1>
		<button onClick={() => drawNumbers(1, 20, 4)}>check</button>
		<LottoResult result={results.length > 0? results[results.length - 1]: null}/>
		<TicketList tickets={tickets} results={results}/>
		<TicketSelect start={1} end={20} n={4} addTicket={addTicket}/>
	</>;
}

function TicketList({tickets, results}) {
	return <>
		<h2>tickets</h2>
		<ul className="tickets">
			{tickets.map((ticket, index) => {
				let drawNumber = ticket.drawNumber;
				let numbers = ticket.numbers;
				let result = results.find(result => result.drawNumber === drawNumber) || {numbers: []};
				return <TicketItem key={index} drawNumber={drawNumber} numbers={numbers} winning={result.numbers}/>;
			})}
		</ul>
	</>;
}

function TicketItem({drawNumber, numbers, winning}) {
	let matches = numbers.filter(number => winning.includes(number)).length;
	let win;
	if (winning.length) {
		if (matches > 0 && matches <= numbers.length) {
			win = `div ${numbers.length - matches + 1}`;
		} else {
			win = "x";
		}
	} else {
		win = "pending";
	}

	return <li className="ticket">
		<div>draw number {drawNumber} - {win}</div>
		<div className="balls">
			{numbers.map((number, index) => <TicketBall key={index} value={number} win={winning.includes(number)}/>)}
		</div>
	</li>;
}

function TicketSelect({start, end, n, addTicket}) {
	const [selecting, setSelecting] = useState(0);
	const [numbers, setNumbers] = useState(Array(n).fill(null));

	let pool = [];
	for (let i = start; i <= end; i++) {
		pool.push(i);
	}

	function changeSelecting(index) {
		if (index < n) {
			setSelecting(index);
		} else if (index >= 0) {
			setSelecting(n - 1);
		} else if (index < 0) {
			setSelecting(0);
		}
	}

	function selectNumber(number) {
		if (numbers.includes(number)) {
			return;
		}

		setNumbers(numbers.map((n, index) => {
			if (index === selecting) {
				return number;
			} else {
				return n;
			}
		}));

		changeSelecting(selecting + 1);
	}

	function clear() {
		setSelecting(0);
		setNumbers(Array(n).fill(null));
	}

	function random() {
		let pool = [];
		for (let i = start; i <= end; i++) {
			pool.push(i);
		}

		let numbers = [];
		for (let i = 0; i < n; i++) {
			let index = Math.floor(Math.random() * pool.length);
			numbers.push(pool[index]);
			pool.splice(index, 1);
		}

		setSelecting(n - 1);
		setNumbers(numbers);
	}

	function add() {
		if (numbers.some(number => number === null)) {
			return;
		}

		addTicket(numbers);
		clear();
	}

	return <>
		<div className="select-numbers">
			{numbers.map((number, index) => {
				return <TicketSelectNumber
					key={index}
					value={number}
					selecting={index === selecting}
					onClick={() => changeSelecting(index)}
				/>;
			})}
		</div>
		<div className="select-buttons">
			{pool.map((number, index) => {
				return <TicketSelectButton
					key={index}
					value={number}
					selected={numbers.includes(number)}
					onClick={() => selectNumber(number)}
				/>;
			})}
		</div>
		<div>
			<button onClick={random}>random</button>
			<button onClick={clear}>clear</button>
			<button onClick={add}>add</button>
		</div>
	</>;
}

function TicketSelectNumber({value, selecting, onClick}) {
	if (selecting) {
		return <button className="ball ball--selecting" onClick={onClick}>{value}</button>;
	} else {
		return <button className="ball" onClick={onClick}>{value}</button>;
	}
}

function TicketSelectButton({value, selected, onClick}) {
	if (selected) {
		return <button className="ball ball--disabled" disabled>{value}</button>;
	} else {
		return <button className="ball" onClick={onClick}>{value}</button>;
	}
}

function TicketBall({value, win}) {
	let classes = ["ball"];
	if (win) {
		classes.push("ball--win");
	}
	return <div className={classes.join(" ")}>{value}</div>;
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
