import random

def toss_coin():
    player_1=input("Enter player 1 choise").capitalize()
    player_2=input("Enter player 2 choise").capitalize()
    
    choice = random.choice(['Heads','Tails'])
    print(f"coin result: {choice}")
    
    if player_1==choice:
        return "Player 1 wins"
    elif player_2==choice:
        return "Player 2 wins"
    else:
        return "No one wins"

winner = toss_coin()
print(winner)

