import * as readline from 'readline';
import * as crypto from 'crypto';

class KeyGenerator {
    static generateKey(): Buffer {
        return crypto.randomBytes(32);
    }
}

class HMACCalculator {
    static calculateHMAC(message: string, key: Buffer): string {
        return crypto.createHmac('sha256', key).update(message).digest('hex');
    }
}

class MoveEvaluator {
    static determineWinner(playerMove: string, computerMove: string, moves: string[]): string {
        const n = moves.length;
        const half = Math.floor(n / 2);
        const indexPlayer = moves.indexOf(playerMove);
        const indexComputer = moves.indexOf(computerMove);
        if (indexPlayer === indexComputer) {
            return "Draw";
        } else if ((indexComputer - indexPlayer + n) % n <= half) {
            return "Computer wins";
        } else {
            return "Player wins";
        }
    }
}

class TableGenerator {
    static generateTable(moves: string[]): string[][] {
        const n = moves.length;
        const table = Array.from({ length: n + 1 }, () => Array(n + 1).fill(''));

        // Fill headers
        table[0][0] = 'v PC\\User >';
        for (let i = 1; i <= n; i++) {
            table[0][i] = moves[i - 1];
            table[i][0] = moves[i - 1];
        }

        // Fill results
        for (let i = 1; i <= n; i++) {
            for (let j = 1; j <= n; j++) {
                if (i === j) {
                    table[i][j] = 'Draw';
                } else if ((j - i + n) % n <= Math.floor(n / 2)) {
                    table[i][j] = 'Win';
                } else {
                    table[i][j] = 'Lose';
                }
            }
        }

        return table;
    }

    static displayTable(moves: string[]): void {
        const table = this.generateTable(moves);

        // Add explanation
        console.log("\nThe table below shows the results from the user's point of view:");
        console.log("Rows represent the PC's move, and columns represent the user's move.\n");

        // Generate and display table
        for (let i = 0; i < table.length; i++) {
            let row = "| ";
            for (let j = 0; j < table[i].length; j++) {
                row += `${table[i][j].padEnd(10)} | `;
            }
            console.log(row);
            if (i === 0) {
                console.log("+" + "-".repeat(12).repeat(table[i].length));
            }
        }
        console.log("\n");
    }
}

class Game {
    private moves: string[];
    private key: Buffer;
    private computerMove: string;

    constructor(moves: string[]) {
        this.moves = moves;
        this.key = KeyGenerator.generateKey();
        this.computerMove = this.moves[Math.floor(Math.random() * this.moves.length)];
    }

    displayHMAC(): void {
        const hmac = HMACCalculator.calculateHMAC(this.computerMove, this.key);
        console.log("HMAC:", hmac);
    }

    displayMenu(): void {
        console.log("\nAvailable moves:");
        for (let i = 0; i < this.moves.length; i++) {
            console.log(`${i + 1} - ${this.moves[i]}`);
        }
        console.log("0 - Exit");
        console.log("? - Help");
    }

    playGame(): void {
        this.displayHMAC();
        this.displayMenu();
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Enter your choice: ', (input) => {
            if (input === '?') {
                Game.displayHelp(this.moves);
                rl.close();
                return;
            }

            const userChoice = parseInt(input);
            if (!isNaN(userChoice) && userChoice >= 0 && userChoice <= this.moves.length) {
                if (userChoice === 0) {
                    console.log("Exiting the game.");
                    rl.close();
                } else {
                    const userMove = this.moves[userChoice - 1];
                    console.log(`Your move: ${userMove}`);
                    console.log(`Computer's move: ${this.computerMove}`);
                    console.log(`HMAC key: ${this.key.toString('hex')}`);

                    const result = MoveEvaluator.determineWinner(userMove, this.computerMove, this.moves);
                    console.log(`Result: ${result}`);
                    rl.close();
                }
            } else {
                console.log("Invalid choice. Please enter a valid number.");
                rl.close();
            }
        });
    }

    static displayHelp(moves: string[]): void {
        TableGenerator.displayTable(moves);
    }
}

// Main program logic
const moves = process.argv.slice(2);
if (moves.length < 3 || moves.length % 2 === 0) {
    console.log("Error: Please provide an odd number of non-repeating moves as command line arguments.");
    console.log("Example: node game.js Rock Paper Scissors");
    process.exit(1);
}

const game = new Game(moves);
game.playGame();

//tsc game2.ts

//node game2.js rock paper scissors

//node game2.js rock paper scissors lizard spock water fire