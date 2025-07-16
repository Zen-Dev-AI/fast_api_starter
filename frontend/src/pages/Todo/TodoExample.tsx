import React, { useState } from 'react';
import {
    useTodos,
    useCreateTodoMutation,
    useUpdateTodoMutation,
    useDeleteTodoMutation,
    type Todo
} from '@/api/todos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Check } from 'lucide-react';

/**
 * Example component demonstrating the new React Query + Ky API
 * This shows how to use all the todo CRUD operations with automatic
 * loading states, error handling, and cache management.
 */
export default function TodoExample() {
    const [newTodoTitle, setNewTodoTitle] = useState('');

    // Fetch todos with automatic caching and background refetching
    const { data: todos, isLoading, error } = useTodos();

    // Mutations with automatic loading states
    const createTodoMutation = useCreateTodoMutation();
    const updateTodoMutation = useUpdateTodoMutation();
    const deleteTodoMutation = useDeleteTodoMutation();

    // Helper function to check if a todo is completed based on title prefix
    const isCompleted = (todo: Todo) => todo.title.startsWith('[DONE] ');

    // Helper function to toggle completion by modifying the title
    const toggleTodoTitle = (todo: Todo) => {
        if (isCompleted(todo)) {
            return todo.title.replace('[DONE] ', '');
        } else {
            return `[DONE] ${todo.title}`;
        }
    };

    const handleCreateTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodoTitle.trim()) return;

        try {
            await createTodoMutation.mutateAsync({
                title: newTodoTitle,
                description: `Created at ${new Date().toLocaleString()}`
            });
            setNewTodoTitle('');
        } catch (error) {
            console.error('Failed to create todo:', error);
        }
    };

    const handleToggleTodo = async (todo: TodoItem) => {
        try {
            await updateTodoMutation.mutateAsync({
                id: todo.id,
                title: toggleTodoTitle(todo),
                description: todo.description
            });
        } catch (error) {
            console.error('Failed to update todo:', error);
        }
    };

    const handleDeleteTodo = async (todoId: number) => {
        try {
            await deleteTodoMutation.mutateAsync(todoId);
        } catch (error) {
            console.error('Failed to delete todo:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-600 bg-red-50 rounded-md">
                Error loading todos: {error.message}
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-800">
                        Todo App - React Query + Ky Example
                    </CardTitle>
                    <p className="text-gray-600">
                        Demonstrating the new API layer with automatic state management
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Create Todo Form */}
                    <form onSubmit={handleCreateTodo} className="flex gap-2">
                        <Input
                            value={newTodoTitle}
                            onChange={(e) => setNewTodoTitle(e.target.value)}
                            placeholder="Add a new todo..."
                            disabled={createTodoMutation.isPending}
                            className="flex-1"
                        />
                        <Button
                            type="submit"
                            disabled={createTodoMutation.isPending || !newTodoTitle.trim()}
                            className="flex items-center gap-2"
                        >
                            {createTodoMutation.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                            Add
                        </Button>
                    </form>

                    {/* Todo List */}
                    <div className="space-y-2">
                        {todos?.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">
                                No todos yet. Create your first one above!
                            </p>
                        ) : (
                            todos?.map((todo) => (
                                <div
                                    key={todo.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border ${isCompleted(todo) ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                                        }`}
                                >
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleToggleTodo(todo)}
                                        disabled={updateTodoMutation.isPending}
                                        className={`p-1 h-8 w-8 ${isCompleted(todo)
                                            ? 'bg-green-100 hover:bg-green-200 text-green-700'
                                            : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        {updateTodoMutation.isPending ? (
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                        ) : isCompleted(todo) ? (
                                            <Check className="h-3 w-3" />
                                        ) : (
                                            <div className="h-3 w-3" />
                                        )}
                                    </Button>

                                    <div className="flex-1">
                                        <h3
                                            className={`font-medium ${isCompleted(todo) ? 'line-through text-gray-500' : 'text-gray-800'
                                                }`}
                                        >
                                            {isCompleted(todo) ? todo.title.replace('[DONE] ', '') : todo.title}
                                        </h3>
                                        {todo.description && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                {todo.description}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDeleteTodo(todo.id)}
                                        disabled={deleteTodoMutation.isPending}
                                        className="p-1 h-8 w-8 text-red-600 hover:bg-red-100 hover:text-red-700"
                                    >
                                        {deleteTodoMutation.isPending ? (
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                        ) : (
                                            <Trash2 className="h-3 w-3" />
                                        )}
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* API Status Indicators */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">API Status:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${createTodoMutation.isPending ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}></div>
                                Create: {createTodoMutation.isPending ? 'Loading...' : 'Ready'}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${updateTodoMutation.isPending ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}></div>
                                Update: {updateTodoMutation.isPending ? 'Loading...' : 'Ready'}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${deleteTodoMutation.isPending ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}></div>
                                Delete: {deleteTodoMutation.isPending ? 'Loading...' : 'Ready'}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}></div>
                                Fetch: {isLoading ? 'Loading...' : 'Ready'}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
