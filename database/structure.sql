create table Users{
    id int primary key,
    username varchar(64) unique not null,
    email varchar(256) unique not null,
    password varchar(128) not null,
    admin boolean not null
};
create table Room{
    id int primary key,
    name varchar(256) not null,
    size int not null
};
create table Machines{
    id int primary key,
    num_seats int not null,
    security_level char(1) not null
};