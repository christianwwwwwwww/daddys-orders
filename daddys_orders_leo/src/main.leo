program daddys_orders_v1.aleo {

    record Order {
        owner: address,
        main: u8,
        side: u8,
        drink: u8,
    }

    transition get_order(public user_address: address, public salt: u64) -> Order {
        let combined: field = (user_address as field) + (salt as field);
        let seed: u128 = BHP256::hash_to_u128(combined);
        let main: u8 = (seed % 6u128) as u8;
        let side: u8 = ((seed / 3u128) % 6u128) as u8;
        let drink: u8 = ((seed / 9u128) % 6u128) as u8;

    return Order {
        owner: self.caller,
        main,
        side,
        drink,
    };}

    transition obey_order(
        public user_address: address,
        public salt: u64,
        public main: u8,
        public side: u8,
        public drink: u8
    ) -> u8 {
        let combined: field = (user_address as field) + (salt as field);
        let seed: u128 = BHP256::hash_to_u128(combined);

        let expected_main: u8 = (seed % 6u128) as u8;
        let expected_side: u8 = ((seed / 3u128) % 6u128) as u8;
        let expected_drink: u8 = ((seed / 9u128) % 6u128) as u8;

        assert(main == expected_main);
        assert(side == expected_side);
        assert(drink == expected_drink);

        return 1u8;
    }
}
