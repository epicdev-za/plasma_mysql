const assert = require('assert');
const PlasmaJs = require('../PlasmaJs');
const TestEntity = require('./Entities/TestEntity');
const TestData = require("./Assets/data");
let test_confirm = {};
let test_count;
let config = {
    user: "core",
    host: "10.0.0.69",
    database: "test",
    port: 3306,
    password: "3picDev031$3pic",
};

describe('Plasma database interaction tests', function () {
    console.log("Running tests");

    let database;
    before(function() {
        database = new PlasmaJs();
        database.connect(config);

        const tests = TestData.test_entity;
        test_count = tests.length;

        TestEntity.initialiseTable( (err,res)=>{
            if(err !== undefined && err !== null){
                console.error(err);
                // done(err);
            }else{
                const tests = TestData.test_entity;
                test_count = tests.length;
                savetests(tests, ()=>{
                    console.log("Finished insert");
                    // done();
                });
            }
        });
    });

    // it('testing database write', function (done) {
    //     TestEntity.initialiseTable( (err,res)=>{
    //         if(err !== undefined && err !== null){
    //             console.error(err);
    //             done(err);
    //         }else{
    //             const tests = TestData.test_entity;
    //             test_count = tests.length;
    //             savetests(tests, ()=>{
    //                 done();
    //             });
    //         }
    //     });
    // });
    describe('inner tests', function () {
        console.log("starrting tests");
        it('testing database read and data comparison', function (done) {
            TestEntity.list((err,res)=>{
                assert.equal(res.length, test_count, 'Testing write count');
                let cnt = 0;
                res.forEach(function(obj, index){
                    let test_obj = test_confirm[obj.uuid];

                    console.log("NME    "+obj.name);

                    assert.equal(obj.name, test_obj.name, 'Testing read on name');
                    assert.equal(obj.string_test, test_obj.string_test, 'Testing read on string_test');
                    assert.equal(obj.int_test, test_obj.int_test, 'Testing read on int_test');
                    assert.equal(obj.double_test, test_obj.double_test, 'Testing read on double_test');
                    cnt++;
                });
                done();
            });
        });

        it('testing get by uuid', function (done) {
            let uuid = Object.keys(test_confirm)[0];
            TestEntity.get(uuid, (err,obj)=>{
                assert.equal(obj.uuid, uuid, 'Testing read on uuid');
                done();
            });
        });

        it('testing count method', function (done) {
            TestEntity.count((err,cnt)=>{
                assert.equal(cnt, test_count, 'Testing count value');
                done();
            });
        });

        it('testing delete', function (done) {
            test_count--;
            let uuid = Object.keys(test_confirm)[0];
            TestEntity.get(uuid, (err,obj)=>{
                obj.delete((err,res)=>{
                    if(err !== undefined && err !== null){
                        console.error(err);
                        done(err);
                    }else{
                        TestEntity.count((err,cnt)=>{
                            assert.equal(cnt, test_count, 'Testing count value after delete');
                            done();
                        });
                    }
                });
            });
        });
    });


    after(function() {
        console.log("CLEAN AFTER");
        database.query("drop table " + TestEntity.getEntity(), [], (err,res)=>{
            if(err === undefined || err == null){
                console.log("Cleaned test database successfully");
            }else{
                console.error("Failed to clean test database successfully");
                console.error(err);
            }
            database.closeConnection();
        });
    });
});

function savetests(tests, callback){
    let inc = 1;
    tests.forEach(function(obj, index){
        let test = new TestEntity().initialise();
        test_confirm[test.uuid]=obj;
        test.name = obj.name;
        test.string_test = obj.string_test;
        test.int_test = obj.int_test;
        test.double_test = obj.double_test;

        test.save((err,res)=>{
            if(err !== undefined && err !== null){
                console.error(err);
            }
            if(inc === tests.length){
                callback();
            }
            inc++;
        });
    });
}

