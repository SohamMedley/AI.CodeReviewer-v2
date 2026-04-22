from typing import List, Dict

class DataAnalyzer:
    """Handles basic statistical analysis on numerical datasets."""
    
    @staticmethod
    def calculate_average(numbers: List[float]) -> float:
        """Calculates the mean of a list of numbers safely."""
        if not numbers:
            return 0.0
            
        try:
            total = sum(numbers)
            return total / len(numbers)
        except TypeError as e:
            print(f"Error: Dataset contains non-numeric values. {e}")
            return 0.0

# Usage
dataset = [10.5, 20.0, 35.5, 40.0]
avg = DataAnalyzer.calculate_average(dataset)
print(f"The calculated average is: {avg:.2f}")