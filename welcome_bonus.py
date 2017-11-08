#!/usr/bin/env python3

import bitcoin.rpc
from twisted.internet import reactor
from twisted.web import resource, server
import requests
import os

API_KEY = os.environ['WELCOME_BONUS_API_KEY']
VALUE = os.environ['WELCOME_BONUS_VALUE']
ENDPOINT = os.environ['WELCOME_BONUS_API_ENDPOINT']


class MyResource(resource.Resource):
    isLeaf = True

    @staticmethod
    def get_address(phone):
        r = requests.get(ENDPOINT + '/pn2a/v1/address/' + phone)
        if r.status_code != 200:
            raise LookupError
        address = r.json()['value']['address']
        return address

    @staticmethod
    def is_welcome_bonus_sent(phone):
        headers = {'api_key': API_KEY}
        r = requests.get(ENDPOINT + '/pn2a/v1/welcome_bonus/' + phone, headers=headers)
        if r.status_code != 200:
            raise LookupError
        print(r.json())
        code = r.json()['code']
        if code == 118021:
            return False
        else:
            if code == 118020:
                return True
        raise Exception

    @staticmethod
    def set_welcome_bonus(phone):
        headers = {'api_key': API_KEY}
        r = requests.post(ENDPOINT + '/pn2a/v1/welcome_bonus/' + phone, headers=headers)
        if r.status_code != 200:
            raise LookupError
        print(r.json())
        code = r.json()['code']
        if code == 118022:
            return True
        raise Exception

    @staticmethod
    def send_welcome_bonus(address,phone):
        proxy = bitcoin.rpc.Proxy()
        print(proxy.getinfo())
        isvalid = proxy._call('validateaddress', str(address))['isvalid']
        print("Is address valid? " + str(isvalid))
        if isvalid:
            proxy.sendtoaddress(address, VALUE)
            print("sendtoaddress called")
            MyResource.set_welcome_bonus(phone)
            print("set_welcome_bonus called")

            return 'sent'
        else:
            return 'invalid address'

    def render_GET(self, request):
        phone = request.postpath[0].decode('utf-8')
        try:
            address = MyResource.get_address(phone)
        except Exception as e:
            err = "can't lookup address from phone " + str(phone) + " " + str(e)
            print(err)
            return err

        print("Lookup address " + address)

        try:
            sent = MyResource.is_welcome_bonus_sent(phone)
        except Exception as e:
            err = "can't check if welcome bonus was already sent " + str(e)
            print(err)
            return err

        if sent:
            to_phone = "welcome bonus already sent to " + phone
            print(to_phone)
            return to_phone

        return MyResource.send_welcome_bonus(address,phone)


site = server.Site(MyResource())

reactor.listenTCP(80, site)
reactor.run()
