function getRandomOrders(array, count, forbiddenOrder) {
  const results = new Set();

  // Function to shuffle the array
  function shuffle(arr) {
    const shuffled = arr.slice(); // Create a copy of the array
    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[i],
      ];
    }
    return shuffled;
  }

  // Generate random permutations until we have the required count or all possible permutations
  while (results.size < count && results.size < factorial(array.length)) {
    let shuffledArray = shuffle(array);
    while (forbiddenOrder.join('_') == shuffledArray.join('_')) {
      console.log('forbiden: ', shuffledArray);
      shuffledArray = shuffle(array);
    }
    results.add(JSON.stringify(shuffledArray));
  }

  // Convert the Set back to an array of arrays
  return Array.from(results).map((item) => JSON.parse(item));
}

// Helper function to calculate factorial (used to limit permutations)
function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

// Example usage:
const inputArray = ['a', 'b', 'c', 'd'];
const randomOrders = getRandomOrders(inputArray, 3, ['b', 'c', 'd', 'a']);
console.log(randomOrders);
