/etc/init.d/mysql stop
cp /home/ezequiel/work/north-db/telas-test/telas/*.MYD /var/lib/mysql/telas/
cp /home/ezequiel/work/north-db/telas-test/telas/*.MYI /var/lib/mysql/telas/
cp /home/ezequiel/work/north-db/telas-test/telas/*.frm /var/lib/mysql/telas/
chown -hR  mysql:mysql /var/lib/mysql/telas/
/etc/init.d/mysql start
