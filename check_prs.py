import urllib.request
import json

try:
    req = urllib.request.Request('https://api.github.com/repos/janavipandole/Cara/pulls', headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        prs = json.loads(response.read().decode())
        for pr in prs:
            if 'Vishnu' in pr['user']['login'] or 'VishnuVardhanCodes' in pr['user']['login']:
                print(f"PR #{pr['number']}: {pr['title']} ({pr['head']['ref']} -> {pr['base']['ref']})")
except Exception as e:
    print("Error:", e)
