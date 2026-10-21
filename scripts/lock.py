#!/usr/bin/env python3
"""Uso: TEAM_PASSWORD=... python3 scripts/lock.py notes.json notes.enc  (cifra le note private del team)"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from crypto_util import encrypt
json.dump(encrypt(json.load(open(sys.argv[1])), os.environ["TEAM_PASSWORD"]), open(sys.argv[2], "w"))
