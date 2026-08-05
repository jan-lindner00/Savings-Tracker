export interface Goal{
    id: string,
    created_at: string,
    created_by: string,
    name: string,
    target: number,
    deadline: string | null,
    saved_money: number 
}

export interface Deposit{
    id: string,
    created_at: string,
    amount: number,
    note: string | null
    user_id: string,
    goal_id: string
}

export interface UserData {
    id: string,
    created_at: string,
    email: string,
    full_name: string,
    avatar_url: string
}