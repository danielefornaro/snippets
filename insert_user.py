# -*- coding: utf-8 -*-
"""
Created on Mon Oct 16 09:29:43 2017

@author: dfornaro

prerequisites:
 pymongo --> pip install pymongo
 pbkdf2 --> pip install pbkdf2
"""

from hashlib import sha256
import hmac
from pymongo import MongoClient
from pbkdf2 import PBKDF2
import random
from sys import argv

def insert_new_user(user, psw):
    client = MongoClient()
    db = client.virtualeuro
    salt = hex(random.getrandbits(128))[2:-1]
    PBKDF2_ROUNDS = 1000
    hash_psw = PBKDF2(psw, salt, iterations = PBKDF2_ROUNDS, macmodule = hmac, digestmodule = sha256).hexread(64)
    result = db.users.insert_one(
        {
            "username": user,
            "salt": salt,
            "hash": hash_psw
        }
    )
    print(result)
    return result

fileName, user, psw = argv      
insert_new_user(user, psw)
