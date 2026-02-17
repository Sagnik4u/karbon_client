
import { v4 as uuidv4 } from 'uuid';

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Group {
    id: string;
    name: string;
    description?: string;
    creatorId: string;
    createdAt: string;
    updatedAt: string;
    participants: Participant[];
    expenses: Expense[];
}

export interface Participant {
    id: string;
    name: string;
    groupId: string;
    userId?: string;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string;
    groupId: string;
    payerId: string;
    payer: Participant;
    splits: ExpenseSplit[];
}

export interface ExpenseSplit {
    id: string;
    expenseId: string;
    participantId: string;
    amount: number;
    participant?: Participant;
}

// Initial Data
const INITIAL_GUEST_DATA: Group[] = [
    {
        id: 'guest-group-1',
        name: 'Weekend Trip',
        description: 'Demo group for guest mode',
        creatorId: 'guest',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        participants: [
            { id: 'p1', name: 'You', groupId: 'guest-group-1', userId: 'guest' },
            { id: 'p2', name: 'Alice', groupId: 'guest-group-1' },
            { id: 'p3', name: 'Bob', groupId: 'guest-group-1' }
        ],
        expenses: []
    }
];

// Helper to get data
const getData = (): Group[] => {
    const data = localStorage.getItem('guest_groups');
    if (!data) {
        localStorage.setItem('guest_groups', JSON.stringify(INITIAL_GUEST_DATA));
        return INITIAL_GUEST_DATA;
    }
    return JSON.parse(data);
};

// Helper to save data
const saveData = (data: Group[]) => {
    localStorage.setItem('guest_groups', JSON.stringify(data));
};

export const GuestService = {
    getGroups: async () => {
        return getData();
    },

    createGroup: async (data: { name: string; description?: string }) => {
        const groups = getData();
        const newGroup: Group = {
            id: uuidv4(),
            name: data.name,
            description: data.description,
            creatorId: 'guest',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            participants: [
                { id: uuidv4(), name: 'You', groupId: '', userId: 'guest' }
            ],
            expenses: []
        };
        newGroup.participants[0].groupId = newGroup.id;
        groups.push(newGroup);
        saveData(groups);
        return newGroup;
    },

    getGroup: async (id: string) => {
        const groups = getData();
        return groups.find(g => g.id === id) || null;
    },

    addParticipant: async (groupId: string, data: { name: string; email?: string }) => {
        const groups = getData();
        const groupIndex = groups.findIndex(g => g.id === groupId);
        if (groupIndex === -1) throw new Error('Group not found');

        const newParticipant: Participant = {
            id: uuidv4(),
            name: data.name,
            groupId: groupId
        };

        groups[groupIndex].participants.push(newParticipant);
        saveData(groups);
        return newParticipant;
    },

    addExpense: async (groupId: string, data: any) => {
        const groups = getData();
        const groupIndex = groups.findIndex(g => g.id === groupId);
        if (groupIndex === -1) throw new Error('Group not found');

        const group = groups[groupIndex];
        const payer = group.participants.find(p => p.id === data.payerId);

        if (!payer) throw new Error("Payer not found");

        const newExpense: Expense = {
            id: uuidv4(),
            description: data.description,
            amount: data.amount,
            date: data.date || new Date().toISOString(),
            groupId: groupId,
            payerId: data.payerId,
            payer: payer,
            splits: data.splits.map((s: any) => ({
                id: uuidv4(),
                expenseId: '', // Will be set momentarily implicitly
                participantId: s.participantId,
                amount: s.amount
            }))
        };

        group.expenses.push(newExpense);
        saveData(groups);
        return newExpense;
    },

    getBalances: async (groupId: string) => {
        const groups = getData();
        const group = groups.find(g => g.id === groupId);
        if (!group) return { balances: {}, settlements: [] };

        const balances: Record<string, number> = {};

        // Initialize balances for all participants
        group.participants.forEach(p => {
            balances[p.id] = 0;
        });

        group.expenses.forEach(expense => {
            const payerId = expense.payerId;
            const paidAmount = Number(expense.amount);

            // Payer gets positive balance (owed to them)
            balances[payerId] = (balances[payerId] || 0) + paidAmount;

            // Splitters get negative balance (they owe)
            expense.splits.forEach(split => {
                const partId = split.participantId;
                const splitAmount = Number(split.amount);
                balances[partId] = (balances[partId] || 0) - splitAmount;
            });
        });

        // Simplified Settlement Logic: (Greedy algorithm not implemented, just pure net balances)
        // For guest mode, returning just balances is often enough to show "who owes what" net.
        // We'll mock a simple settlement structure for the UI to display something.

        const settlements: any[] = [];
        const debtors = Object.entries(balances).filter(([, amount]) => amount < -0.01).sort((a, b) => a[1] - b[1]);
        const creditors = Object.entries(balances).filter(([, amount]) => amount > 0.01).sort((a, b) => b[1] - a[1]);

        let i = 0;
        let j = 0;

        while (i < debtors.length && j < creditors.length) {
            const [debtorId, debtorAmount] = debtors[i];
            const [creditorId, creditorAmount] = creditors[j];

            const amount = Math.min(Math.abs(debtorAmount), creditorAmount);
            const roundedAmount = Math.round(amount * 100) / 100;

            if (roundedAmount > 0) {
                settlements.push({
                    from: debtorId,
                    to: creditorId,
                    amount: roundedAmount
                });
            }

            debtors[i][1] += roundedAmount;
            creditors[j][1] -= roundedAmount;

            if (Math.abs(debtors[i][1]) < 0.01) i++;
            if (creditors[j][1] < 0.01) j++;
        }

        return { balances, settlements };
    }
};
