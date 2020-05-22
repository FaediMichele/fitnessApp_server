export function searchObjectInArray(array, object, arrayField) {
    for (let i = 0; i < array.length; i++) {
        if (array[i][arrayField] == object) {
            return array[i];
        }
    }
    return undefined;
}

export function getObjectsArray2inArray1(array1, array2, fieldArray1, fieldArray2) {
    let ret = [];
    for (let i = 0; i < array1.length; i++) {
        for (let j = 0; j < array2.length; j++) {
            if (array1[i][fieldArray1] == array2[j][fieldArray2]) {
                ret.push(array2[j]);
            }
        }
    }
    return ret;
}