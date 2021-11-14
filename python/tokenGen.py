
import time
import jwt
import json

with open("dancing-moves-a1fd4cf1afe7.json") as file:
    private_dict = json.loads(file.read())
    iat = int(time.time())
    exp = iat + 3600
    payload = {'iss': private_dict["client_email"],
               'sub': private_dict["client_email"],
               'scope': 'https://www.googleapis.com/auth/spreadsheets',
               'aud': private_dict["token_uri"],
               'iat': iat,
               'exp': exp}
    additional_headers = {'kid': private_dict["private_key_id"]}
    privatekey = private_dict["private_key"]
    print(privatekey)
    signed_jwt = jwt.encode(payload, privatekey, headers=additional_headers,
                            algorithm='RS256')
    print(signed_jwt)                        
