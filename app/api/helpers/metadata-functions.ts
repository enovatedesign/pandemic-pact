function numDigits(x: number) {
    const result = Math.max(Math.floor(Math.log10(Math.abs(x))), 0) + 1;
    if (result === 4) {
      return result;
    } else {
      return null;
    }
  }

  export default numDigits