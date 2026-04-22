class InventoryManager:
    def __init__(self):
        # BAD: Mutable default argument will be shared across all instances
        self.all_items = self.create_inventory()
        
    def create_inventory(self, items=[]):
        items.append("Starter Kit")
        return items

    def calculate_total_value(self, prices):
        total = 0
        for item in self.all_items:
            # Bug: Assuming prices is a dictionary but handling missing keys poorly
            total += prices[item] 
            
        print("Total value is: " + total) # Bug: Cannot concatenate str and int
        return total

inv = InventoryManager()
inv.calculate_total_value({"Starter Kit": 50, "Health Potion": 20})