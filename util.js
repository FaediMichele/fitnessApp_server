function searchObjectInArray(array, object, arrayField) {
    for (let i = 0; i < array.length; i++) {
        if (array[i][arrayField] == object) {
            return array[i];
        }
    }
    return undefined;
};

function getObjectsArray2inArray1(array1, fieldArray1, array2, fieldArray2) {
    let ret = [];
    for (let i = 0; i < array1.length; i++) {
        for (let j = 0; j < array2.length; j++) {
            if (array1[i][fieldArray1] == array2[j][fieldArray2]) {
                ret.push(array2[j]);
            }
        }
    }
    return ret;
};

function getBestInArray(array, arrayField, f) {
    let ret = array[0];
    for (let i = 1; i < array.length; i++) {
        if (f(array[i][arrayField], ret[arrayField]) > 0) {
            ret = array[i];
        }
    }
    return ret;
}

module.exports = { getObjectsArray2inArray1, searchObjectInArray, getBestInArray };