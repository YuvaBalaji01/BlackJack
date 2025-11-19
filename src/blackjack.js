import React, { useState } from 'react';
import { getRandomCard } from './utils/cardLogic'; // Import the function

function Blackjack() {
    // --- STATE MANAGEMENT ---
    // Player State
    const [playerCards, setPlayerCards] = useState([]);
    const [playerSum, setPlayerSum] = useState(0);
    const [playerChips, setPlayerChips] = useState(200);

    // Dealer State
    const [dealerCards, setDealerCards] = useState([]);
    const [dealerSum, setDealerSum] = useState(0);

    // Game State
    const [isGameActive, setIsGameActive] = useState(false); // Replaces isAlive
    const [message, setMessage] = useState("Want to play a round?");
    const [betAmount, setBetAmount] = useState(10); // Simple betting
    const [lastDrawnCardIndex, setLastDrawnCardIndex] = useState(-1); // Index of the last card to animate
// ...
    const [isWinBurstActive, setIsWinBurstActive] = useState(false);

    // --- HELPER FUNCTIONS ---

    // New: Checks for Ace conversion (11 -> 1) to prevent bust
    const calculateSum = (cards) => {
        let sum = cards.reduce((acc, card) => acc + card, 0);
        let numAces = cards.filter(card => card === 11).length;

        // Convert Aces from 11 to 1 if the sum is over 21
        while (sum > 21 && numAces > 0) {
            sum -= 10; // Change 11 to 1
            numAces--;
        }
        return sum;
    };
    
    // --- GAME LOGIC ---

    const startGame = () => {
        if (playerChips < betAmount) {
            setMessage("You don't have enough chips to bet.");
            return;
        }

        setIsGameActive(true);
        setMessage("Drawing cards...");

        // Player's initial draw
        const newPlayerCards = [getRandomCard(), getRandomCard()];
        const newPlayerSum = calculateSum(newPlayerCards);
        setPlayerCards(newPlayerCards);
        setPlayerSum(newPlayerSum);
        
        setPlayerCards(newPlayerCards);
        setPlayerSum(newPlayerSum);
        setLastDrawnCardIndex(newPlayerCards.length - 1);

        // Dealer's initial draw (only one visible card)
        const newDealerCards = [getRandomCard(), getRandomCard()];
        const newDealerSum = calculateSum(newDealerCards);
        setDealerCards(newDealerCards);
        setDealerSum(newDealerSum);

        // Check for immediate Blackjack
        if (newPlayerSum === 21) {
            checkFinalWinner(newPlayerSum, newDealerSum, newPlayerCards, newDealerCards);
        } else {
            setMessage("Do you want to Hit or Stand?");
        }
    };

    const newCard = () => {
        if (!isGameActive || playerSum >= 21) return;

        const card = getRandomCard();
        const updatedCards = [...playerCards, card];
        const newSum = calculateSum(updatedCards);

        setPlayerCards(updatedCards);
        setPlayerSum(newSum);
        setLastDrawnCardIndex(updatedCards.length - 1);

        if (newSum > 21) {
            setMessage("Bust! You are out of the game.");
            setIsGameActive(false);
            setPlayerChips(prev => prev - betAmount);
        } else if (newSum === 21) {
             // If player hits 21, automatically stand and start dealer turn
             stand(updatedCards, newSum); 
        }
    };

    const stand = (finalPlayerCards = playerCards, finalPlayerSum = playerSum) => {
        if (!isGameActive) return;

        setIsGameActive(false);

        // 1. Dealer's Turn Logic
        let currentDealerCards = [...dealerCards];
        let currentDealerSum = dealerSum;

        // Dealer must hit until sum is 17 or more
        while (currentDealerSum < 17) {
            const card = getRandomCard();
            currentDealerCards.push(card);
            currentDealerSum = calculateSum(currentDealerCards);
        }

        setDealerCards(currentDealerCards);
        setDealerSum(currentDealerSum);

        // 2. Final Winner Check
        checkFinalWinner(finalPlayerSum, currentDealerSum);
    };

   const checkFinalWinner = (pSum, dSum) => {
    let finalMessage = "";
    let newChips = playerChips;
    let playerWon = false; // New flag to easily check for win

    if (pSum > 21) {
        finalMessage = "Bust! Dealer Wins.";
        newChips -= betAmount;
    } else if (dSum > 21) {
        finalMessage = "Dealer Busted! You Win!";
        newChips += betAmount;
        playerWon = true;
    } else if (pSum > dSum) {
        finalMessage = "You Win!";
        newChips += betAmount;
        playerWon = true;
    } else if (pSum < dSum) {
        finalMessage = "Dealer Wins!";
        newChips -= betAmount;
    } else {
        finalMessage = "It's a Push (Tie)! Bet returned.";
    }

    setMessage(finalMessage);
    setPlayerChips(newChips);

    // --- NEW ANIMATION LOGIC ---
    if (playerWon) {
        setIsWinBurstActive(true);
        // Hide the burst animation after 1.5 seconds
        setTimeout(() => {
            setIsWinBurstActive(false);
        }, 1500);
    }
    // --- END NEW ANIMATION LOGIC ---
};

    // --- RENDER/JSX ---
    return (
        <div className="blackjack-container">
            <h1>React Blackjack</h1>
            
            {/* Player Info */}
            {/* --- NEW: Party Burst Element --- */}
    {isWinBurstActive && (
        <div className="win-burst">
            🎉 YOU WIN! 🎉
        </div>
    )}
            <p>
                **Player: Per** | Chips: **${playerChips}** | Current Bet: ${betAmount}
            </p>

            {/* Dealer Display */}
           // Dealer Display (Updated)
<div className="hand-display">
    <h2>Dealer's Hand (Sum: {isGameActive ? '?' : dealerSum})</h2>
    <p>Cards: {dealerCards.map((card, index) => (
        <span key={index} className="card-tile">
            {isGameActive && index === 1 ? '?' : card} 
        </span>
    ))}</p>
</div>
            <hr/>

            {/* Player Display */}
          // Player Display (Updated)
<div className="hand-display">
    <h2>Your Hand (Sum: {playerSum})</h2>
    <p>Cards: {playerCards.map((card, index) => (
    <span 
        key={index} 
        className={`card-tile ${index === lastDrawnCardIndex ? 'card-drawn-animation' : ''}`}
    >
        {card}
    </span>
))}</p>
</div>
            
            {/* Action Buttons */}
            <div className="actions">
                <button onClick={startGame} disabled={isGameActive}>
                    Start Game
                </button>
                <button onClick={newCard} disabled={!isGameActive}>
                    Hit (New Card)
                </button>
                <button onClick={stand} disabled={!isGameActive}>
                    Stand
                </button>
            </div>
        </div>
    );
}

export default Blackjack;