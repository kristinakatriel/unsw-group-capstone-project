import pytest
import server as app
# import src
from flask import Flask, jsonify
# from your_flask_app import server  # Replace with your actual app import

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

SUCCESS = 200
ERROR = 400
ACCESSERROR = 403
default_url = 'http://localhost:5000/'  # dummy URL

# TODO: test writing for all 5 things wow
########################################

#        1. USER/AUTH/REGISTER

########################################
# 1. SUCCESS - returns the access and refresh token 
# 2. ERROR - no email given
# 3. ERROR - no valid email given (case match with "@" present maybe ???)
# 4. ERROR - no password given
# 5. ERROR - invalid password given (doesn't fit alphanumeric cases)
# 6. ERROR - no name given
# 7. ERROR - name doesn't fit the alphanumeric cases
# 8. ERROR - Email already exists for a user (aka user is registered in the system)


########################################

#        2. USER/AUTH/LOGIN

########################################
# 1. SUCCESS - returns the access and refresh token 
# 2. ERROR - no email given
# 3. ERROR - email given or password given is incorrect [but exists] ("invalid credentials given")
# 4. ERROR - email does not exist as the user is not registered
# 5. ERROR - no password given


########################################

#        3. USER/AUTH/LOGOUT

########################################
# 1. SUCCESS - revokes tokens after user is logged out
# 2. ACCESSERROR - Forbidden: User is not logged in to get logged out
# 3. ACCESSERROR (maybe case) - User's account is suspended


########################################

#        4. TOKEN/REFRESH

########################################
# 1. SUCCESS - Get a new access token 
# 2. ERROR - Invalid or expired token (??? how do we test this hmm)

########################################

#        5. TOKEN/REVOKE

########################################
# 1. SUCCESS - Token access is revoked
# 2. ACCESSERROR - User is not authenticated to revoke the token (aka the user logs out before the session probably)

"""

CODE :D BELOW AS SHOWN 

"""
########################################

#        1. USER/AUTH/REGISTER

########################################

def test_register_success(client):
    response = client.post('/user/auth/register', json={
        'email': 'test@example.com',
        'password': 'TestPassword123',
        'name': 'TestUser'
    })
    assert response.status_code == SUCCESS
    json_data = response.get_json()
    assert 'access_token' in json_data
    assert 'refresh_token' in json_data

def test_register_no_email(client):
    response = client.post('/user/auth/register', json={
        'password': 'TestPassword123',
        'name': 'TestUser'
    })
    assert response.status_code == ERROR
    assert response.get_json()['error'] == 'Input invalid'

def test_register_invalid_email(client):
    response = client.post('/user/auth/register', json={
        'email': 'invalid_email',
        'password': 'TestPassword123',
        'name': 'TestUser'
    })
    assert response.status_code == ERROR
    # Add any further validation error handling if applicable

def test_register_no_password(client):
    response = client.post('/user/auth/register', json={
        'email': 'test@example.com',
        'name': 'TestUser'
    })
    assert response.status_code == ERROR
    assert response.get_json()['error'] == 'Input invalid'

def test_register_invalid_password(client):
    response = client.post('/user/auth/register', json={
        'email': 'test@example.com',
        'password': 'invalid',
        'name': 'TestUser'
    })
    assert response.status_code == ERROR
    # Add further password validation error if applicable

def test_register_no_name(client):
    response = client.post('/user/auth/register', json={
        'email': 'test@example.com',
        'password': 'TestPassword123'
    })
    assert response.status_code == ERROR
    assert response.get_json()['error'] == 'Input invalid'

def test_register_existing_user(client):
    # Assuming 'test@example.com' was already registered
    response = client.post('/user/auth/register', json={
        'email': 'test@example.com',
        'password': 'TestPassword123',
        'name': 'TestUser'
    })
    assert response.status_code == ERROR
    assert response.get_json()['error'] == 'User exists'
    

########################################

#        2. USER/AUTH/LOGIN

########################################

def test_login_success(client):
    response = client.post('/user/auth/login', json={
        'email': 'test@example.com',
        'password': 'TestPassword123'
    })
    assert response.status_code == SUCCESS
    json_data = response.get_json()
    assert 'access_token' in json_data
    assert 'refresh_token' in json_data

def test_login_no_email(client):
    response = client.post('/user/auth/login', json={
        'password': 'TestPassword123'
    })
    assert response.status_code == ERROR
    assert response.get_json()['error'] == 'Credentials required'

def test_login_invalid_credentials(client):
    response = client.post('/user/auth/login', json={
        'email': 'wrong@example.com',
        'password': 'wrongpassword'
    })
    assert response.status_code == ERROR
    assert response.get_json()['error'] == 'Credentials invalid'

def test_login_no_password(client):
    response = client.post('/user/auth/login', json={
        'email': 'test@example.com'
    })
    assert response.status_code == ERROR
    assert response.get_json()['error'] == 'Credentials required'
    
########################################

#        3. USER/AUTH/LOGOUT

########################################

def test_logout_success(client, access_token):
    headers = {'Authorization': f'Bearer {access_token}'}
    response = client.post('/user/auth/logout', headers=headers)
    assert response.status_code == SUCCESS
    assert response.get_json()['message'] == 'Logout successful... test@example.com'

def test_logout_not_logged_in(client):
    response = client.post('/user/auth/logout')
    assert response.status_code == ACCESSERROR
    assert response.get_json()['msg'] == 'Missing Authorization Header'
    
# TODO: check this one
# def test_logout_account_suspended(client, access_token):
#     # Assuming some condition that leads to account suspension
#     headers = {'Authorization': f'Bearer {access_token}'}
#     response = client.post('/user/auth/logout', headers=headers)
#     assert response.status_code == ACCESSERROR
#     # Check for any specific message you return in this case
    
########################################

#        4. TOKEN/REFRESH

########################################

def test_token_refresh_success(client, refresh_token):
    headers = {'Authorization': f'Bearer {refresh_token}'}
    response = client.post('/token/refresh', headers=headers)
    assert response.status_code == SUCCESS
    json_data = response.get_json()
    assert 'access_token' in json_data

def test_token_refresh_invalid_token(client):
    headers = {'Authorization': 'Bearer invalid_refresh_token'}
    response = client.post('/token/refresh', headers=headers)
    assert response.status_code == ERROR
    # Add more assertions for error message if applicable

########################################

#        5. TOKEN/REVOKE

########################################

def test_revoke_token_success(client, access_token):
    headers = {'Authorization': f'Bearer {access_token}'}
    response = client.post('/token/revoke', headers=headers)
    assert response.status_code == SUCCESS
    assert response.get_json()['message'] == 'Token revoked'

def test_revoke_token_not_authenticated(client):
    response = client.post('/token/revoke')
    assert response.status_code == ACCESSERROR
    assert response.get_json()['msg'] == 'Missing Authorization Header'