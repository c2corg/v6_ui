# Sets up an instance of the API server running at localhost:5432

# clone repo, set up database and install dependencies
git clone https://github.com/c2corg/v6_api.git
cd v6_api
echo "create user \"www-data\" with password 'www-data;'" | psql -U postgres
PGUSER=postgres USER=travis scripts/create_user_db_test.sh
make -f config/travis .build/dev-requirements.timestamp
make -f config/travis install
.build/venv/bin/initialize_c2corg_api_db development.ini

# run the test server in the background
echo "Starting API server..."
nohup make -f config/travis serve 2>&1&
echo $! > server_pid.txt
# wait for the server to start
.build/venv/bin/python -c "from webtest.http import check_server
print('Status: %s' % (check_server('localhost', 6543)))"
echo "API server running on localhost:6543"
