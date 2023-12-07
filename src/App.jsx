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
			claim: false,
			prize: 0,
		};

		tickets.push(ticket);
		return true;
	}

	function updateTickets() {
		setTickets([...tickets]);
	}

	function claimTicket(ticket) {
		wallet.save(ticket.prize);
		ticket.prize = 0;
		setTickets([...tickets]);
	}

	return <>
		<h1>mini lotto</h1>
		<LottoResult check={() => drawNumbers(START, END, N)} result={results.length > 0? results[results.length - 1]: {drawNumber: 0, numbers: Array(N).fill("?")}}/>
		<div className="wallet box">
			<h2>wallet</h2>
			<div>${wallet.money}</div>
			<div className="buttons">
				<Modal title={"tickets"}>
					<TicketList tickets={tickets} results={results} drawNumber={results.length > 0? drawNumber: 0} claimTicket={claimTicket} setTickets={setTickets}/>
				</Modal>
				<Modal title={"play"}>
					<TicketSelect start={START} end={END} n={N} addTicket={addTicket} updateTickets={updateTickets}/>
				</Modal>
			</div>
		</div>
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

function Modal({title, children}) {
	const [show, setShow] = useState(false);

	let backgroundStyle = {
		position: "fixed",
		top: "0",
		left: "0",
		width: "100%",
		height: "100%",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		opacity: show? "1": "0",
		pointerEvents: show? "auto": "none",
		transition: "opacity 0.2s",
	};
	let contentStyle = {
		position: "absolute",
		top: "50%",
		left: "50%",
		display: "flex",
		flexDirection: "column",
		width: "30rem",
		height: "50rem",
		maxWidth: "calc(100% - 2rem)",
		maxHeight: "calc(100% - 2rem)",
		padding: "1rem",
		border: "1px solid black",
		backgroundColor: "white",
		transform: show? "translate(-50%, -50%)": "translate(-50%, calc(-50% + 3rem))",
		transition: "transform 0.2s",
	};
	let closeStyle = {
		position: "absolute",
		top: "1rem",
		right: "1rem",
		display: "block",
		width: "2rem",
		height: "2rem",
		padding: "0",
		border: "none",
		lineHeight: "1rem",
		backgroundColor: "transparent",
	};
	let titleStyle = {marginTop: "0"};
	let innerStyle = {
		flexGrow: "1",
		height: "100%",
		overflow: "auto",
	};

	function open(event) {
		setShow(true);
	}

	function close(event) {
		if (event.target !== event.currentTarget) {
			return;
		}
		setShow(false);
	}

	return <>
		<button onClick={open}>{title}</button>
		<div style={backgroundStyle} onClick={close}>
			<div style={contentStyle}>
				<button style={closeStyle} onClick={close}>X</button>
				<h2 style={titleStyle}>{title}</h2>
				<div style={innerStyle}>
					{children}
				</div>
			</div>
		</div>
	</>;
}

function TicketList({tickets, results, drawNumber, claimTicket, setTickets}) {
	function clearTickets() {
		let newTickets = tickets.filter(ticket => {
			if (ticket.drawNumber > drawNumber) {
				return true;
			} else if (!ticket.prize) {
				return false;
			} else if (ticket.claim) {
				return true;
			} else {
				return false;
			}
		});

		setTickets(newTickets);
	}

	function claimAll() {
		tickets.forEach(ticket => claimTicket(ticket));
		setTickets([...tickets]);
	}

	return <>
		<ul className="tickets">
			{tickets.map((ticket, index) => {
				let drawNumber = ticket.drawNumber;
				let numbers = ticket.numbers;
				let result = results.find(result => result.drawNumber === drawNumber) || {numbers: []};
				return <TicketItem key={index} drawNumber={drawNumber} ticket={ticket} winning={result.numbers} claimTicket={claimTicket}/>;
			})}
		</ul>
		<div className="buttons">
			<button onClick={claimAll}>claim all</button>
			<button onClick={clearTickets}>clear</button>
		</div>
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
			if (!ticket.claim) {
				ticket.prize = PRIZES[division - 1];
				ticket.claim = true;
			}
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
		{ticket.prize > 0 && <button className="claim-button" onClick={() => claimTicket(ticket)}>claim ${ticket.prize}</button>}
	</li>;
}

function TicketSelect({start, end, n, addTicket, updateTickets}) {
	const [tickets, setTickets] = useState([Array(n).fill(null)]);
	const [ticketNumber, setTicketNumber] = useState(0);
	const [selecting, setSelecting] = useState(0);

	let pool = [];
	for (let i = start; i <= end; i++) {
		pool.push(i);
	}

	function changeSelecting(index, ticket) {
		if (ticket !== undefined) {
			setTicketNumber(ticket);
		}

		if (index < 0) {
			setSelecting(0);
		} else if (index < n) {
			setSelecting(index);
		} else {
			if (tickets.length > ticketNumber + 1) {
				setTicketNumber(ticketNumber + 1);
				setSelecting(0);
			} else {
				setSelecting(n - 1);
			}
		}
	}

	function moreTicket() {
		tickets.push(Array(n).fill(null));
		if (ticketNumber === tickets.length - 2 && selecting === n - 1) {
			setTicketNumber(ticketNumber + 1);
			setSelecting(0);
		}

		setTickets([...tickets]);
	}

	function lessTicket(remove) {
		let newTickets = tickets.filter(ticket => ticket !== remove);

		if (ticketNumber >= newTickets.length) {
			setTicketNumber(newTickets.length - 1);
		}

		setTickets([...newTickets]);
	}

	function selectNumber(number, ticket) {
		let numbers = tickets[ticketNumber];

		if (numbers.includes(number)) {
			return;
		}
		if (ticket !== ticketNumber) {
			return;
		}

		tickets[ticketNumber] = (numbers.map((n, index) => {
			if (index === selecting) {
				return number;
			} else {
				return n;
			}
		}));

		changeSelecting(selecting + 1);
		setTickets([...tickets]);
	}

	function clear(index) {
		setSelecting(0);
		if (index !== undefined) {
			tickets[index] = Array(n).fill(null);
		} else {
			tickets[ticketNumber] = Array(n).fill(null);
		}
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

		tickets[ticketNumber] = numbers;
		changeSelecting(n);
		setTickets([...tickets]);
	}

	function add() {
		tickets.forEach((numbers, index) => {
			if (numbers.some(number => number === null)) {
				return;
			}

			let added = addTicket(numbers);
			if (added) {
				clear(index);
			}
		});

		let newTickets = [...tickets.filter(ticket => !ticket.every(number => number === null))];
		if (newTickets.length === 0) {
			newTickets.push(Array(n).fill(null));
		}
		setTickets(newTickets);

		changeSelecting(0, 0);
		updateTickets();
	}

	return <>
		{tickets.map((numbers, ticketIndex) => {
			return <div key={ticketIndex}>
				<div className="select-numbers">
					{numbers.map((number, index) => {
						return <TicketSelectNumber
							key={index}
							value={number}
							selecting={ticketIndex === ticketNumber && index === selecting}
							onClick={() => changeSelecting(index, ticketIndex)}
						/>;
					})}
				</div>
				{tickets.length > 1 && <button className="remove-button" onClick={() => lessTicket(numbers)}>remove</button>}
				<div className="select-buttons">
					{pool.map((number, index) => {
						return <TicketSelectButton
							key={index}
							value={number}
							selected={numbers.includes(number)}
							onClick={() => selectNumber(number, ticketIndex)}
						/>;
					})}
				</div>
			</div>;
		})}
		<div className="wallet__buttons buttons">
			<button onClick={moreTicket}>more</button>
			<button onClick={random}>random</button>
			<button onClick={() => clear()}>clear</button>
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

function LottoResult({result, check}) {
	return <div className="lotto-result box">
		<h2 className="lotto-result__heading">results</h2>
		<button className="lotto-result__check" onClick={check}>check</button>
		<div>draw number {result.drawNumber || "-"}</div>
		<div className="results balls">
			{result.numbers.map((number, index) => <LottoBall key={index} value={number}/>)}
		</div>
	</div>;
}

function LottoBall({value}) {
	return <div className="ball">{value}</div>;
}
