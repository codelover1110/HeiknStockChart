from subprocess import run
from time import sleep

## Allows auto-restarting of bot in case something bad happens
## midday

# Path and name to the script you are trying to start
file_path = "paper-trader.py" 

restart_timer = 20
def start_script():
    try:
        # Make sure 'python3' command is available
        run(["python3", "paper-trader.py"], check=True) 
    except Exception as e:
        print(e)
        # Script crashed, lets restart it!
        handle_crash()

def handle_crash():
    print("Program has crashed!, Restarting in 20s")
    sleep(restart_timer)  # Restarts the script after 20 seconds
    start_script()

start_script()
