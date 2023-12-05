import React, {useState} from "react";

const START = 1;
const END = 20;
const N = 4;
const START_MONEY = 100;
const PRIZES = [50, 20, 10, 5]

export default function App() {
	const [drawNumber, setDrawNumber] = useState(1);
	const [results, setResults] = useState([]);
	const [tickets, setTickets] = useState([]);
	const [wallet, setWallet] = useState(new Wallet(START_MONEY));

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
		try {
			wallet.spend(5);
		} catch (err) {
			if (err instanceof NoMoneyError) {
				console.log(err);
				return false;
			} else {
				throw err;
			}
		}

		let ticket = {
			drawNumber,
			numbers,
			claimed: false,
			prize: 0,
		};

		setTickets([...tickets, ticket]);

		return true;
	}

	function claimTicket(ticket) {
		wallet.save(ticket.prize);
		ticket.prize = 0;
		setTickets([...tickets]);
	}

	return <>
		<h1>mini lotto</h1>
		<button onClick={() => drawNumbers(START, END, N)}>check</button>
		<LottoResult result={results.length > 0? results[results.length - 1]: null}/>
		<h2>wallet</h2>
		<div>${wallet.money}</div>
		<TicketSelect start={START} end={END} n={N} addTicket={addTicket}/>
		<TicketList tickets={tickets} results={results} claimTicket={claimTicket}/>
	</>;
}

class NoMoneyError extends Error {

	constructor() {
		super("not enough money!");
	}

}

class Wallet {

	constructor(money) {
		this.money = money;
	}

	spend(amount) {
		if (this.money >= amount) {
			this.money -= amount;
			return true;
		} else {
			throw new NoMoneyError();
		}
	}

	save(amount) {
		this.money += amount;
	}

}

function TicketList({tickets, results, claimTicket}) {
	return <>
		<h2>tickets</h2>
		<ul className="tickets">
			{tickets.map((ticket, index) => {
				let drawNumber = ticket.drawNumber;
				let numbers = ticket.numbers;
				let result = results.find(result => result.drawNumber === drawNumber) || {numbers: []};
				return <TicketItem key={index} drawNumber={drawNumber} ticket={ticket} winning={result.numbers} claimTicket={claimTicket}/>;
			})}
		</ul>
	</>;
}

function TicketItem({drawNumber, ticket, winning, claimTicket}) {
	let numbers = ticket.numbers;
	let matches = numbers.filter(number => winning.includes(number)).length;
	let win;
	if (winning.length) {
		if (matches > 0 && matches <= numbers.length) {
			let division = numbers.length - matches + 1;
			win = `div ${division}`;
			if (!ticket.claimed) {
				ticket.prize = PRIZES[division - 1];
				ticket.claimed = true;
			}
		} else {
			win = "x";
		}
	} else {
		win = "pending";
	}

	return <li className="ticket">
		{ticket.prize > 0?
			<div>draw number {drawNumber} - {win} <button onClick={() => claimTicket(ticket)}>claim ${ticket.prize}</button></div>:
			<div>draw number {drawNumber} - {win}</div>
		}
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

		let added = addTicket(numbers);
		if (added) {
			clear();
		}
	}

	return <>
		<h2>play</h2>
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
		<h2>results</h2>
		<div>draw number {result.drawNumber}</div>
		<div className="results balls">
			{result.numbers.map((number, index) => <LottoBall key={index} value={number}/>)}
		</div>
	</>;
}

function LottoBall({value}) {
	return <div className="ball">{value}</div>;
}
