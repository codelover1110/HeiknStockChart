from sec_api import QueryApi, XbrlApi
import json
api_key = "ceb4fe3dce3bcca698ae0ea3983cd58aca2ad1cb017e68a8b05f25d3b49bfe5d"

queryApi = QueryApi(api_key=api_key)

query = {
    "query": { "query_string": { 
            "query": "ticker:TSLA AND filedAt:{2021-01-01 TO 2021-12-31} AND formType:\"10-Q\"" 
        } },
    "from": "0",
    "size": "10",
    "sort": [{ "filedAt": { "order": "desc" } }]
}

filings = queryApi.get_filings(query)
filings = filings['filings'][0]
html_url = filings['linkToFilingDetails']
print (html_url)
        
xbrlApi = XbrlApi(api_key)
xbrl_json = xbrlApi.xbrl_to_json(
    htm_url=html_url
)
xbrl_keys = xbrl_json.keys()

# focus_keys = ['StatementsOfIncome', 'BalanceSheets', 'StatementsOfCashFlows']
# for key in focus_keys:
#     print("====== {} =======\n{}".format(key, xbrl_json[key].keys()))
statmentofincome =  (xbrl_json['StatementsOfIncome'])
statmentofincome_result = dict()
for soi_key in statmentofincome.keys():
    values = statmentofincome[soi_key]
    extracted = []
    for value in values:
        item = dict()
        item['end_date'] = value['period']['endDate']
        item['value'] = value['value']
        extracted.append(item)
    statmentofincome_result[soi_key] = extracted

print (json.dumps(statmentofincome_result))


        
