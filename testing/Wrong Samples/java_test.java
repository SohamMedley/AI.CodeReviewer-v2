import java.util.Scanner;

public class DataProcessor {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("Enter a sentence to reverse:");
        String input = scanner.nextLine();
        
        String[] words = input.split(" ");
        String reversed = "";
        
        // ERROR: Loop condition should be i >= 0, currently throws ArrayIndexOutOfBoundsException
        for (int i = words.length; i > 0; i--) {
            reversed += words[i] + " "; 
        }
        
        System.out.println("Reversed: " + reversed.trim());
        // ERROR: Scanner is never closed, causing a resource leak
    }
}