-- Per-employee permission flags. Never checked by name — always by citizenid,
-- because names change and aren't a safe identity to gate money-actions on.
Permissions = {
    BUY_STOCK = 'can_buy_stock',       -- wholesale-purchase inventory, truck it to the warehouse
    MANAGE_FLOOR = 'can_manage_floor', -- move warehouse units onto the sales floor
    FINANCE = 'can_finance',           -- deposit/withdraw the dealership account, pay salaries
    ADMIN = 'is_admin',                -- everything above + manage employees + edit catalog/prices
}

-- ADMIN implies every other permission, so callers only need to check one flag
-- instead of ANDing four columns together everywhere.
function HasDealershipPermission(employeeRow, permission)
    if not employeeRow then return false end
    if employeeRow.is_admin == 1 then return true end
    if permission == Permissions.ADMIN then return false end
    return employeeRow[permission] == 1
end
