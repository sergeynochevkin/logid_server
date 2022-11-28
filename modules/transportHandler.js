const transportHandler = function (types, load_capacities, side_types) {

    //усовершенствовать логику включить в нее опции
    
    types.includes('electric_scooter' || 'bike') ? types.push('walk', 'electric_scooter', 'bike') : types
    types.includes('scooter') ? types.push('walk', 'electric_scooter', 'bike') : types
    types.includes('combi') ? types.push('car') : types
    types.includes('minibus') ? types.push('combi') : types
 
    load_capacities.push('')
    load_capacities.includes('10') ? load_capacities.push('5') : load_capacities
    load_capacities.includes('3') ? load_capacities.push('1.5') : load_capacities

    side_types.push('')
    side_types.includes('hard_top') ? side_types.push('awing') : side_types

    return (
        types, load_capacities, side_types
    )
}

module.exports = {
    transportHandler
}