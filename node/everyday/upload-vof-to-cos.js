if (shell.exec('wget -O ' + '../../vof/old' + vofFileName + ' ' + vofDownUrl).code !== 0) {
    shell.echo('Error: wget failed');
    shell.exit(1);
}