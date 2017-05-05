-- Lua script that rearranges a Redis sorted set
-- Useful if one needs to store rearrangeable sequences of values (when the order is important)

-- Based on the following assumtions:
-- * Scores are integer values
-- * Scores are increasing by 1 respectively
-- * First score in the sequence is zero

-- Usage:
-- EVAL '...' 1 key position member
--
-- Where:
-- `key` is the key holding a sorted set to work on
-- `position` is an integer representing the number to move the specified item with (negative numbers are welcome)
-- `member` is the member of set to move

-- Example:
-- ZADD example 0 a 1 b 2 c 3 d 4 e 5 f
-- # order: abcdef
-- EVAL '...' 1 example 2 b
-- # order: acdbef
-- EVAL '...' 1 example -1 e
-- # order: acdebf
-- EVAL '...' 1 example -3 f
-- # order: acfdeb
-- EVAL '...' 1 example 4 a
-- # order: cfdeab
-- EVAL '...' 1 example 1 b
-- # order: cfdeab
-- EVAL '...' 1 example -1 c
-- # order: cfdeab
-- EVAL '...' 1 example 16 f
-- # order: cdeabf
-- EVAL '...' 1 example -140 d
-- # order: dceabf
-- EVAL '...' 1 example 1 a
-- # order: dcebaf
-- EVAL '...' 1 example 0 a
-- # order: dcebaf

local delta = tonumber(ARGV[1])

assert(
    type(delta) == "number" and delta % 1 == 0,
    "position argument must be integer"
)

local increment = delta > 0
local score = redis.call("zscore", KEYS[1], ARGV[2])

local affected = (
    increment and
        redis.call("zrangebyscore", KEYS[1], score + 1, score + delta) or
        redis.call("zrevrangebyscore", KEYS[1], score - 1, score + delta)
)

if score + delta < 0 then
    redis.call("zadd", KEYS[1], 0, ARGV[2])
else
    local card = redis.call("zcard", KEYS[1])

    if score + delta >= card then
        redis.call("zadd", KEYS[1], card - 1, ARGV[2])
    else
        redis.call("zincrby", KEYS[1], delta, ARGV[2])
    end
end

increment = increment and -1 or 1

for k,v in pairs(affected) do
    redis.call("zincrby", KEYS[1], increment, v)
end
