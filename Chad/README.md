# IB trading bot

Documentation and guides can be found in `/docs`.

New features are first added in the `dev` branch. Stable code can be found in `master`.

If you want to use Polygon as a datasource, be sure to save your API key in a file named "polygon.key"
in the configs folder.

## Scanner

Running `scanner-gui.py` will load a GUI that takes data from IB TWS and applies the filter in `/lib/heikfilter` to 
judge whether to buy or sell. Bar duration and time to refresh can be configured from inside the code itself. 
As an input it takes the stocks listed in `stocks.csv`.

## Server

The bot is currently running on an azure virtual machine.

ip: 20.109.83.247

user: superuser

pass: U!o^rsqBiG06QI3W0B@*


